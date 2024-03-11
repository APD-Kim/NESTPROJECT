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
import { ReservationSeat } from './reservation-seats.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  reservationId: number;

  @Column()
  concertId: number;

  @Column()
  userId: number;

  @Column()
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.reservation)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Concert, (concert) => concert.reservation)
  @JoinColumn({ name: 'concertId' })
  concert: Concert;

  @OneToMany(() => ReservationSeat, (reservationSeat) => reservationSeat.reservation, { cascade: true })
  reservationSeat: ReservationSeat[];
}
