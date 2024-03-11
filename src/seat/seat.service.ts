import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';
import _ from 'lodash';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
  ) {}
  create(createSeatDto: CreateSeatDto) {
    return 'This action adds a new seat';
  }

  findAll() {
    return `This action returns all seat`;
  }

  async findSeat(seatId: number) {
    const findSeat = await this.seatRepository.findOne({
      where: { seatId },
    });
    if (_.isNil(findSeat)) {
      throw new NotFoundException('해당 좌석을 찾을 수 없습니다.');
    }
    return findSeat;
  }

  async checkReserveSeat(seatId: number) {
    const findSeat = await this.findSeat(seatId);

    if (findSeat.isReserved === true) {
      throw new ForbiddenException(`${findSeat.seatId}번 좌석은 이미 예약되어있습니다.`);
    }
    return findSeat;
  }

  async updateSeatStatus(manager: EntityManager, seatId: number, isReserved: boolean) {
    await manager.update(Seat, seatId, { isReserved });
  }

  remove(id: number) {
    return `This action removes a #${id} seat`;
  }
}
