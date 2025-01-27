import dotenv from 'dotenv'; 
dotenv.config();
import express from "express";
import http from 'http';
import cors from 'cors';
import sequelize from './database/sequelize';
import authRoutes from "./routes/authRoutes";
import TaskScheduler from "./crons/scheduleTask";
import log from "./utils/logger";
import { authenticateToken } from './middlewares/auth';
import { initializeWebSocketServer } from './websocket';
import { runMigrations } from './database/migrationHelper';

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

(async () => {
  try {
    await sequelize.authenticate();
    log.info('Database connection successful');
    await runMigrations();
  } catch (error) {
    log.error('Unable to connect to the database:', error);
    process.exit(1);
  }

  TaskScheduler.start();

  initializeWebSocketServer(server);

  app.use('/api/auth', authRoutes);
  app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile('dashboard.html', { root: 'public' });
  });

  server.listen(PORT, () => {
    log.info(`Application is starting up at PORT ${PORT}`);
  });
})();
