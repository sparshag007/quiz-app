import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'games' })
export class Game extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  gameId!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  player1Id!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  player2Id!: number;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'pending' })
  status!: string; // 'pending', 'completed'

  @Column({ type: DataType.INTEGER, allowNull: true })
  winnerId!: number | null;
}
