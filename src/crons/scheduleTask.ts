import schedule from 'node-schedule';
import log from "../utils/logger";
import { fetchAndStoreTriviaQuestions } from '../crons/fetchQuestions';

class TaskScheduler {
  static start() {

    // Every minute job to fetch questions in the db
    schedule.scheduleJob('*/1 * * * *', () => {
    log.info('Fetching the questions...');
    fetchAndStoreTriviaQuestions();
    log.info('Questions added to DB successfully');
});

    log.info('Scheduled tasks are running');
  }
}

export default TaskScheduler;
