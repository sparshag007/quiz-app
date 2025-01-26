import { WebSocketServer, WebSocket } from 'ws';
import log from './utils/logger';
import { verifyToken } from './utils/jwtUtils';
import { getQuestions } from './database/queries/questionQueries';
import { Question } from './database/models/Question';
import { storePlayerAnswers } from './database/queries/playerAnswersQueries';
import { createGame, updateGameWinner } from './database/queries/gameQueries';

interface WebSocketMessage {
  type: string;
  payload?: any;
}

const activeGames = new Map<string, { players: any[]}>();
const connectedUsers = new Map<string, WebSocket>();

export function initializeWebSocketServer(): void {
  const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT, 10) : 8080;
  const wss = new WebSocketServer({ port: WEBSOCKET_PORT });

  log.info(`WebSocket server started on port ${WEBSOCKET_PORT}`);

  wss.on('connection', (ws: WebSocket, req: any) => {
    const token = req.headers['sec-websocket-protocol'];

    if (!token) {
        ws.close(4001, 'Token is required');
        return;
    }

    try {
        const decoded = verifyToken(token) as { email: string; id: string };
        const { email, id } = decoded;
        log.info(`New WebSocket connection established with client: ${email}`);
        connectedUsers.set(id, ws);
        ws.on('message', (message: string | Buffer) => {
          try {
            const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
            handleWebSocketMessage(ws, parsedMessage);
          } catch (error) {
            log.error('Invalid WebSocket message format:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
          }
        });
  
        ws.on('close', () => {
          handleWebSocketDisconnection(ws, id);
          log.info(`WebSocket connection closed for client: ${email}`);
        });
    } catch (error) {
        log.error('WebSocket connection rejected: Invalid token', error);
        ws.close(4002, 'Invalid token');
    }
  });
}

function handleWebSocketMessage(ws: WebSocket, message: WebSocketMessage): void {
    const { type, payload } = message;
  
    switch (type) {
        case 'findMatch':
            handleFindMatch(ws, payload);
            break;
        case 'submitQuiz':
            handleSubmitQuiz(ws, payload);
            break;
        default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
}

async function handleFindMatch(ws: WebSocket, payload: { userId: string }): Promise<void> {
    const { userId } = payload;
  
    if (!userId) {
      ws.send(JSON.stringify({ type: 'error', message: 'User ID is required' }));
      return;
    }

    connectedUsers.set(userId, ws);

    // Find a waiting user who is not already in an active game
    const waitingUser = Array.from(connectedUsers.keys()).find(
        (id) => 
            id !== userId && 
            !Array.from(activeGames.values()).some((game) =>
                game.players.some((player) => player.userId === id)
            )
    );
  
    if (waitingUser) {
        // Create a game if a waiting user is found
        const gameId = `${userId}-${waitingUser}-${Date.now()}`;
        const user1Socket = connectedUsers.get(userId);
        const user2Socket = connectedUsers.get(waitingUser);
  
        if (user1Socket && user2Socket) {
            try {
                const questions = await getQuestions(6);
                activeGames.set(gameId, {
                    players: [
                        { userId: parseInt(userId, 10), score: null },
                        { userId: parseInt(waitingUser, 10), score: null },
                    ],
                });
                await createGame(gameId, parseInt(userId, 10), parseInt(waitingUser, 10));
                user1Socket.send(
                    JSON.stringify({ type: 'gameStart', payload: { gameId, opponent: waitingUser, questions } })
                );
                user2Socket.send(
                    JSON.stringify({ type: 'gameStart', payload: { gameId, opponent: userId, questions } })
                );
            } catch (err) {
                ws.send(JSON.stringify({ type: 'error', message: 'Error fetching questions or creating game' }));
            }
        }
    } else {
      ws.send(JSON.stringify({ type: 'waiting', message: 'Waiting for another player to join...' }));
    }
}

function handleWebSocketDisconnection(ws: WebSocket, userId: string): void {
    connectedUsers.delete(userId);
    const gameId = Array.from(activeGames.keys()).find((id) => id.includes(userId));
    if (gameId) {
      const game = activeGames.get(gameId);
      const opponentId = game?.players.find((player) => player !== userId);
      const opponentSocket = connectedUsers.get(opponentId || '');
      if (opponentSocket) {
        opponentSocket.send(JSON.stringify({ type: 'opponentDisconnected' }));
      }
      activeGames.delete(gameId);
    }
}

async function handleSubmitQuiz(
    ws: WebSocket,
    payload: {
      gameId: string;
      userId: string;
      responses: { questionId: number; recordedAnswer: string; correctAnswer: string }[];
    }
): Promise<void> {
    const { userId, gameId, responses } = payload;
    let score = 0;
    responses.forEach((response) => {
      if (response.recordedAnswer === response.correctAnswer) {
        score++;
      }
    });
  
    try {
        await storePlayerAnswers({
            userId: parseInt(userId, 10),
            gameId,
            responses
        });
        const game = activeGames.get(gameId);
        if (game) {
            const player = game.players.find((player) => player.userId === parseInt(userId, 10));
            if (player) {
                player.score = score;
            }
            const allPlayersFinished = game.players.every((player) => player.score !== null);
            if (allPlayersFinished) {
                // Calculate results and send them to players
                const results = calculateResults(gameId);
                await sendResultsToPlayers(ws, results);
            } else {
                // Notify the player that their submission was successful
                ws.send(
                    JSON.stringify({
                        type: 'gameEnd',
                        payload: { message: 'You have submitted your answers. Waiting for your opponent.' },
                    })
                );
            }
        } else {
            ws.send(
                JSON.stringify({
                    type: 'error',
                    message: 'Game not found. Please try again.',
                })
            );
        }
    } catch (error) {
        log.error('Error storing player answers:', error);
        ws.send(
            JSON.stringify({
                type: 'error',
                message: 'An error occurred while submitting the quiz. Please try again.',
            })
        );
    }
  }

  function calculateResults(gameId: string): { gameId: string; scores: Record<string, number>; winner: string } {
    const game = activeGames.get(gameId);
    if (!game) {
        throw new Error('Game not found');
    }
    const scores: Record<string, number> = {};
    let highestScore = -1;
    let winner = "Draw";
    game.players.forEach((player) => {
        if (player.score === null) {
            throw new Error(`Player ${player.userId} has no score recorded`);
        }
        scores[player.userId] = player.score;

        if (player.score > highestScore) {
            highestScore = player.score;
            winner = player.userId;
        } else if (player.score === highestScore) {
            winner = "Draw";
        }
    });
    return {
        gameId,
        scores,
        winner,
    };
}


async function sendResultsToPlayers(ws: WebSocket, results: any) {
    const players = activeGames.get(results.gameId)?.players;
    if (!players) {
        throw new Error('No active game found');
    }
    players.forEach((player) => {
        const playerSocket = connectedUsers.get(player.userId);
        if (playerSocket) {
            playerSocket.send(
                JSON.stringify({
                    type: 'gameResults',
                    payload: { results },
                })
            );
        } else {
            log.error(`No active WebSocket connection for player: ${player.userId}`);
        }
    });
    const winner = results.winner === 'Draw' ? 0 : parseInt(results.winner);
    await updateGameWinner(results.gameId, winner);
    activeGames.delete(results.gameId);
    players.forEach((player) => {
        connectedUsers.delete(player.userId);
        log.info(`Removed player ${player.userId} from connected users.`);
    });
    log.info(`Game ${results.gameId} has been cleared from active games.`);
}

  
  


