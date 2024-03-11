import { Concert } from '../../concert/entities/concert.entity';
import { User } from '../../user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Seat } from '../../seat/entities/seat.entity';
import { seatGrade } from '../dto/create-reservation.dto';

@Entity()
export class ReservationSeat {
  @PrimaryColumn()
  seatId: number;

  @PrimaryColumn()
  reservationId: number;

  @Column()
  grade: seatGrade;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Reservation, (reservation) => reservation.reservationSeat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @ManyToOne(() => Seat, (seat) => seat.reservationSeat)
  @JoinColumn({ name: 'seatId' })
  seat: Seat;
}
