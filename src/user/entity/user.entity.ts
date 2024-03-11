import { Point } from '../../point/entity/point.entity';
import { PointHistory } from '../../point/entity/point.history.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['email'])
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ nullable: true, length: 50, type: 'varchar' })
  email?: string | null;

  @Column({ nullable: false, length: 20, type: 'varchar' })
  username: string;

  @Column({ nullable: false, length: 1000, type: 'varchar', select: false })
  password: string;

  @Column({ default: false, type: 'boolean' })
  isValid: boolean;

  @Column({ default: false, type: 'boolean' })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => Point, (point) => point.user)
  point: Point[];

  @OneToMany(() => PointHistory, (pointHistory) => pointHistory.user)
  pointHistory: PointHistory[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservation: Reservation[];
}
