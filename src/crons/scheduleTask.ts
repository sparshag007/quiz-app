import schedule from 'node-schedule';
import log from "../utils/logger";
import { fetchAndStoreTriviaQuestions } from '../crons/fetchQuestions';

class TaskScheduler {
  static start() {

    // Hourly job to fetch questions in the db
    schedule.scheduleJob('0 * * * *', () => {
        log.info('Fetching the questions...');
        fetchAndStoreTriviaQuestions();
        log.info('Questions added to DB successfully');
    });

    log.info('Scheduled tasks are running');
  }
}

export default TaskScheduler;
