import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Seat } from '../seat/entities/seat.entity';
import { Concert } from '../concert/entities/concert.entity';
import { Reservation } from './entities/reservation.entity';
import { SeatService } from '../seat/seat.service';
import { ConcertService } from '../concert/concert.service';
import { User } from '../user/entity/user.entity';
import { Point } from '../point/entity/point.entity';
import { PointService } from '../point/point.service';
import { ReservationSeat } from './entities/reservation-seats.entity';
import { PointHistory } from '../point/entity/point.history.entity';
import { PointHistoryStatus } from '../point/point-history-status-enum';
import _ from 'lodash';
import { SeatGrade } from '../seat/seat-grade-enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ReservationService {
  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private seatService: SeatService,
    private concertService: ConcertService,
    private pointService: PointService,
  ) {}
  async createReservation(createReservationDto: CreateReservationDto, user: User) {
    const { concertId, reservationSeats } = createReservationDto;

    await this.concertService.findOneConcert(concertId);
    let totalPrice = 0;
    //for of문으로 각각의 좌석에 대한 예매 가능 여부 체크
    for (const seat of reservationSeats) {
      const findSeat = await this.seatService.checkReserveSeat(seat.seatId);
      seat.grade = findSeat.grade;
      totalPrice += findSeat.price;
    }
    const userPoint = await this.pointService.getUserPoint(user.userId);
    if (userPoint - totalPrice < 0) {
      throw new ForbiddenException(`포인트가 ${totalPrice - userPoint}포인트 더 필요합니다.`);
    }
    const remainPoint = userPoint - totalPrice;
    const transactionResult = await this.entityManager.transaction('REPEATABLE READ', async (manager) => {
      const createReservationDao = manager.create(Reservation, {
        concertId: createReservationDto.concertId,
        userId: user.userId,
        totalPrice,
      });
      const createdReservation = await manager.save(createReservationDao);

      for (const seat of reservationSeats) {
        const createReservationSeatDao = manager.create(ReservationSeat, {
          reservationId: createdReservation.reservationId,
          seatId: seat.seatId,
          grade: seat.grade,
        });
        await manager.save(createReservationSeatDao);
        await this.seatService.updateSeatStatus(manager, seat.seatId, true);
      }

      await this.pointService.updateUserPoint(manager, user.userId, remainPoint);
      const pointHistory = await this.pointService.createPointHistory(
        manager,
        user.userId,
        totalPrice,
        PointHistoryStatus.usePoint,
        remainPoint,
      );
      return {
        createReservationDao,
        pointHistory,
      };
    });
    return transactionResult;
  }
  //예매 모두 확인
  async findAllReservation(user: User) {
    const { userId } = user;
    const reservations = await this.reservationRepository.find({ where: { userId }, relations: ['reservationSeat'] });
    if (_.isEmpty(reservations)) {
      throw new NotFoundException('예약 목록이 없습니다.');
    }
    return reservations;
  }
  //특정 예매 확인
  async findOneReservation(user: User, reservationId: number) {
    const { userId } = user;
    const reservation = await this.reservationRepository.findOne({
      where: { reservationId },
      relations: ['reservationSeat'],
    });
    if (_.isNil(reservation)) {
      throw new NotFoundException('해당 예약을 찾을 수 없습니다.');
    }
    if (reservation.userId !== userId) {
      throw new ForbiddenException('해당 예약을 열람할 권한이 없습니다.');
    }
    return reservation;
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return `This action updates a #${id} reservation`;
  }

  async cancelReservation(reservationId: number, user: User) {
    //예약의 userId와 로그인한 유저의 아이디가 동일한지 확인
    //동일하다면 예약을 취소함(여기서 cascade를 사용하여 예약된 좌석 테이블의 데이터들도 모두 삭제)
    //취소와 동시에 예약에 잡혀있던 좌석들의 isReserved 값을 false로 바꿈
    //그 후에 포인트를 환불(충전)해줌
    //그리고 해당 포인트 내역에 대한 히스토리 또한 작성
    const { userId } = user;
    const reservationData = await this.findOneReservation(user, reservationId);

    const { reservationSeat } = reservationData;

    const userPoint = await this.pointService.getUserPoint(userId);
    const refundPoint = reservationData.totalPrice;
    const totalPoint = refundPoint + userPoint;
    console.log(totalPoint);

    await this.entityManager.transaction(async (manager) => {
      //해당 예약 삭제
      await manager.delete(Reservation, reservationId);
      //예약 잡혀있던 좌석 값 false로 변경
      reservationSeat.map(async (seat) => {
        return await this.seatService.updateSeatStatus(manager, seat.seatId, false);
      });
      await this.pointService.updateUserPoint(manager, userId, totalPoint);
      await this.pointService.createPointHistory(manager, userId, refundPoint, PointHistoryStatus.addPoint, totalPoint);
    });
    return { message: `${reservationId}번 예약이 성공적으로 취소되었습니다.` };
  }
}
