import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Game } from './Game';
import { Question } from './Question';
import { User } from './User';

@Table({ tableName: 'player_answers' })
class PlayerAnswer extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  playerId!: number;

  @ForeignKey(() => Game)
  @Column({ type: DataType.STRING, allowNull: false })
  gameId!: string;

  @ForeignKey(() => Question)
  @Column({ type: DataType.INTEGER, allowNull: false })
  questionId!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  answer!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isCorrect!: boolean;
}

export { PlayerAnswer };
