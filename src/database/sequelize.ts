import { Sequelize } from 'sequelize-typescript';
import {User} from './models/User';
import { Question } from './models/Question';
import { Game } from './models/Game';
import { PlayerAnswer } from './models/PlayerAnswer';

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.USE_SSL === "true" ? { require: true, rejectUnauthorized: false } : false
  },
  logging: false,
  models: [User, Question, Game, PlayerAnswer],
});

export default sequelize;
