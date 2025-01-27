import { exec } from 'child_process';
import log from '../utils/logger';

export const runMigrations = () => {
  log.info('Running migrations using npm script...');
  return new Promise<void>((resolve, reject) => {
    exec('npm run migrate', (error, stdout, stderr) => {
      if (error) {
        log.error(`Error executing migrations: ${error.message}`);
        reject(`Error executing migrations: ${error.message}`);
        return;
      }
      if (stderr) {
        log.error(`stderr: ${stderr}`);
        reject(`stderr: ${stderr}`);
        return;
      }
      log.info(`stdout: ${stdout}`);
      resolve();
    });
  });
};
