import { User } from '../../user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ConcertCategory } from '../concert-category-enum';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { Seat } from '../../seat/entities/seat.entity';

@Entity()
export class Concert {
  @PrimaryGeneratedColumn()
  concertId: number;

  @Column()
  name: string;

  @Column()
  content: string;

  @Column()
  place: string;

  @Column()
  concertImage: string;

  @Column()
  startDate: Date;

  @Column()
  concertCategory: ConcertCategory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.concert)
  reservation: Reservation[];

  @OneToMany(() => Seat, (seat) => seat.concert)
  seat: Seat[];
}
