import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConcertModule } from './concert/concert.module';
import Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/entity/user.entity';
import { PointModule } from './point/point.module';
import { ReservationModule } from './reservation/reservation.module';
import { SeatModule } from './seat/seat.module';
import { Point } from './point/entity/point.entity';
import { Reservation } from './reservation/entities/reservation.entity';
import { ReservationSeat } from './reservation/entities/reservation-seats.entity';
import { Seat } from './seat/entities/seat.entity';
import { PointHistory } from './point/entity/point.history.entity';
import { Concert } from './concert/entities/concert.entity';
import { LoggingInterceptor } from './logging.interceptor';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from './logger/logger.module';
import { CommonModule } from './common/common.module';

const typeOrmModuleOptions = {
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [User, Point, Reservation, ReservationSeat, Seat, Concert, PointHistory],
    synchronize: configService.get('DB_SYNC'),
  }),
  inject: [ConfigService],
};

export const queueFactory = (configService: ConfigService) => ({
  redis: {
    host: configService.get<string>('REDIS_HOST', { infer: true }),
    port: configService.get<number>('REDIS_PORT', { infer: true }),
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: queueFactory,
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    ConcertModule,
    PointModule,
    ReservationModule,
    SeatModule,
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: process.env.REDIS_URL,
      }),
    }),
    CacheModule.register({ isGlobal: true, ttl: 30, max: 300 }),
    LoggerModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggingInterceptor],
  exports: [LoggingInterceptor],
})
export class AppModule {}
