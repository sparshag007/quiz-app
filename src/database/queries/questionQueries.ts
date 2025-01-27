import { Sequelize } from 'sequelize';
import { Question } from '../models/Question';

async function getQuestions(limit?: number) {
  try {
    const queryOptions: any = {
      order: Sequelize.literal('RANDOM()')
    };

    if (limit) {
      queryOptions.limit = limit;
    }

    const questions = await Question.findAll(queryOptions);
    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

export { getQuestions };
