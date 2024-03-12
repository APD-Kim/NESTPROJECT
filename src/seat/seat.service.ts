import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';
import _ from 'lodash';
import { PaginateSeatsDto } from './dto/paginate-seat.dto';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
  ) {}
  create(createSeatDto: CreateSeatDto) {
    return 'This action adds a new seat';
  }

  async paginateSeats(dto: PaginateSeatsDto) {
    const where: FindOptionsWhere<Seat> = {};
    if (dto.where__id_less_than) {
      where.seatId = LessThan(dto.where__id_less_than);
    } else if (dto.where__id_more_than) {
      where.seatId = MoreThan(dto.where__id_more_than);
    }
    const findSeats = await this.seatRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    const lastItem = findSeats.length > 0 && findSeats.length === dto.take ? findSeats[findSeats.length - 1] : null;

    const nextUrl = lastItem && new URL('http://localhost:3000/seat');

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }
      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id_more_than';
      } else {
        key = 'where__id_less_than';
      }
      nextUrl.searchParams.append(key, lastItem.seatId.toString());
    }

    return {
      data: findSeats,
      cursor: {
        after: lastItem?.seatId ?? null,
      },
      count: findSeats.length,
      url: nextUrl?.toString() ?? null,
    };
  }

  async generateSeat() {}

  async findSeat(seatId: number): Promise<Seat> {
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
