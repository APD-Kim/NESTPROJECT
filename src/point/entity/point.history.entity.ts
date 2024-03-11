import { User } from '../../user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { PointHistoryStatus } from '../point-history-status-enum';

@Entity()
export class PointHistory {
  @PrimaryGeneratedColumn()
  historyId: number;

  @Column()
  userId: number;

  @Column()
  changedPoint: number;

  @Column()
  currentPoint: number;

  @Column()
  status: PointHistoryStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.pointHistory)
  @JoinColumn({ name: 'userId' })
  user: User;
}
