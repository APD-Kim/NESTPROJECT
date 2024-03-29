import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concert } from 'src/concert/entities/concert.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { SeatModule } from 'src/seat/seat.module';
import { ConcertModule } from 'src/concert/concert.module';
import { User } from 'src/user/entity/user.entity';
import { PointModule } from 'src/point/point.module';
import { Reservation } from './entities/reservation.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Concert, Seat, Reservation]),
    SeatModule,
    ConcertModule,
    AuthModule,
    PointModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
