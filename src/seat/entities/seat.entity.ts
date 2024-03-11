import { Concert } from '../../concert/entities/concert.entity';
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
import { SeatGrade } from '../seat-grade-enum';
import { ReservationSeat } from '../../reservation/entities/reservation-seats.entity';
import { seatGrade } from '../..//reservation/dto/create-reservation.dto';

@Entity()
export class Seat {
  @PrimaryGeneratedColumn()
  seatId: number;

  @Column()
  concertId: number;

  @Column()
  grade: seatGrade;

  @Column({ default: false })
  isReserved: boolean;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Concert, (concert) => concert.seat)
  @JoinColumn({ name: 'concertId' })
  concert: Concert;

  @OneToMany(() => ReservationSeat, (reservationSeat) => reservationSeat.seat)
  reservationSeat: ReservationSeat[];
}
