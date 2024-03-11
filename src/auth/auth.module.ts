import { Global, Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { GetUser } from './get-user.decorator';
import { PointModule } from 'src/point/point.module';
import { Point } from 'src/point/entity/point.entity';
import { RolesGuard } from './roles.guard';
import { BullModule } from '@nestjs/bull';
import { ReservationProcessor } from './bull.processor';
import { redisClientFactory } from 'src/redis/redis';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),

    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 60 * 60 * 5,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Point]),
    forwardRef(() => PointModule),
    BullModule.registerQueue({
      name: 'valid',
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, ReservationProcessor],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, RolesGuard],
})
export class AuthModule {}
