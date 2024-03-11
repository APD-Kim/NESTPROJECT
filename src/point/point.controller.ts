import { Controller, Get, UseGuards } from '@nestjs/common';
import { PointService } from './point.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entity/user.entity';

@Controller('point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  test(@GetUser() user: User) {
    return user;
  }
}
