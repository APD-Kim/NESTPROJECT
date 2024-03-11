import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/entity/user.entity';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createReservation(@Body() createReservationDto: CreateReservationDto, @GetUser() user: User) {
    return await this.reservationService.createReservation(createReservationDto, user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAllReservation(@GetUser() user: User) {
    return this.reservationService.findAllReservation(user);
  }

  @Get(':reservationId')
  @UseGuards(AuthGuard('jwt'))
  findOneReservation(@Param('reservationId') reservationId: number, @GetUser() user: User) {
    return this.reservationService.findOneReservation(user, reservationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationService.update(+id, updateReservationDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') reservationid: number, @GetUser() user: User) {
    return this.reservationService.cancelReservation(reservationid, user);
  }

  @Post('/queue')
  async create(@Body() reservationData: any) {
    await this.reservationService.createReservationByQueue(reservationData);
    return { message: 'Reservation created and added to the queue.' };
  }
}
