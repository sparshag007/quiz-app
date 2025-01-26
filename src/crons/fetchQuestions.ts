import axios from 'axios';
import { Question } from '../database/models/Question';
import log from '../utils/logger';

const API_URL = process.env.OPENTDB_URL;

export async function fetchAndStoreTriviaQuestions() {
  try {
    const url: string = API_URL + '?amount=10&difficulty=medium&type=multiple';
    const response = await axios.get(url);
    const triviaQuestions = response.data.results;

    for (const question of triviaQuestions) {
      const { question: questionText, correct_answer, incorrect_answers } = question;

      const options = [correct_answer, ...incorrect_answers];
      options.sort(() => Math.random() - 0.5);

      const correctAnswerIndex = options.indexOf(correct_answer);

      await Question.create({
        text: questionText,
        options: options,
        correctAnswer: correctAnswerIndex,
      });
    }
  } catch (error) {
    log.info('Error fetching or storing trivia questions:', error);
  }
}