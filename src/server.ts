import dotenv from 'dotenv'; 
dotenv.config();
import express from "express";
import cors from 'cors';
import sequelize from './database/sequelize';
import authRoutes from "./routes/authRoutes";
import TaskScheduler from "./crons/scheduleTask";
import log from "./utils/logger";
import { authenticateToken } from './middlewares/auth';
import { initializeWebSocketServer } from './websocket';

const app = express();
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

(async () => {
  try {
    await sequelize.authenticate();
    log.info('Database connected successfully');
  } catch (error) {
    log.error('Unable to connect to the database:', error);
    process.exit(1);
  }

  TaskScheduler.start();

  initializeWebSocketServer();

  app.use('/api/auth', authRoutes);
  app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile('dashboard.html', { root: 'public' });
  });

  app.listen(PORT, () => {
    log.info(`Application is starting up at PORT ${PORT}`);
  });
})();
