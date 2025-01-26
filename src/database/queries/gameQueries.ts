import log from "../../utils/logger";
import { Game } from "../../database/models/Game";

export async function createGame(gameId: string, player1Id: number, player2Id: number): Promise<void> {
    try {
        const game = {
            gameId: gameId,
            player1Id: player1Id,
            player2Id: player2Id,
            status: 'pending',
            winnerId: null
        }
        await Game.create(game, { validate: true });

        log.info('Game created successfully');
    } catch (error) {
        if (error instanceof Error) {
            log.error('Validation Error:', error.message);
            if ('errors' in error) {
                const validationErrors = (error as any).errors;
                validationErrors.forEach((err: any) => {
                    log.error(`Validation Field: ${err.path}`);
                    log.error(`Validation Message: ${err.message}`);
                });
            }
        }
        throw new Error('Failed to create game.');
    }
    
}

export async function updateGameWinner(gameId: string, winnerId: number): Promise<Game> {
    try {
        const game = await Game.findOne({ where: { gameId } });
        if (!game) {
            throw new Error(`Game with gameId ${gameId} not found`);
        }
        game.winnerId = winnerId;
        game.status = 'completed';
        await game.save();

        log.info(`Game ${gameId} updated with winnerId: ${winnerId}`);
        return game;
    } catch (error) {
        console.error(`Failed to update winnerId for gameId ${gameId}:`, error);
        throw error;
    }
}
