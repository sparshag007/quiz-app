import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'questions' })
class Question extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  text!: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  options!: string[];

  @Column({ type: DataType.INTEGER, allowNull: false })
  correctAnswer!: number;
}

export { Question };
