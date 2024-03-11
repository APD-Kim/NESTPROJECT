import { Module, forwardRef } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Point } from './entity/point.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointHistory } from './entity/point.history.entity';

@Module({
  imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([Point, PointHistory])],
  providers: [PointService],
  controllers: [PointController],
  exports: [PointService],
})
export class PointModule {}
