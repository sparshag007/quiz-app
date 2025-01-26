import log from "../../utils/logger";
import { PlayerAnswer } from "../../database/models/PlayerAnswer";

export async function storePlayerAnswers(data: { userId: number; gameId: string; responses: { questionId: number; recordedAnswer: string; correctAnswer: string }[] }): Promise<void> {
    const { userId, gameId, responses } = data;
    const records = responses.map(response => ({
        playerId: userId,
        gameId: gameId,
        questionId: response.questionId,
        answer: response.recordedAnswer,
        isCorrect: response.recordedAnswer === response.correctAnswer,
    }));
    try {
        await PlayerAnswer.bulkCreate(records, { validate: true });
        log.info('Player answers successfully stored in the database.');
    } catch (error) {
        log.error('Error storing player answers:', error);
        throw new Error('Failed to store player answers.');
    }
}

