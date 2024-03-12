import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Point } from './entity/point.entity';
import _ from 'lodash';
import { NotFoundError } from 'rxjs';
import { PointHistoryStatus } from './point-history-status-enum';
import { PointHistory } from './entity/point.history.entity';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private pointRepository: Repository<Point>,
    @InjectRepository(PointHistory)
    private pointHistoryRepository: Repository<PointHistory>,
  ) {}
  async getUserPoint(userId: number) {
    const userPoint: Point = await this.pointRepository.findOneBy({ userId });
    if (_.isNil(userPoint)) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }
    return userPoint.point;
  }
  async getUserPointByHistory(userId: number) {
    const userPoint: PointHistory[] = await this.pointHistoryRepository.find({ where: { userId } });
    if (_.isNil(userPoint)) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }
    return userPoint;
  }

  async updateUserPoint(manager: EntityManager, userId: number, remainPoint: number): Promise<void> {
    await manager.update(Point, userId, { point: remainPoint });
  }
  async createPointHistory(
    manager: EntityManager,
    userId: number,
    changedPoint: number,
    status: PointHistoryStatus,
    currentPoint: number,
  ): Promise<PointHistory> {
    const pointHistoryDao = manager.create(PointHistory, {
      userId,
      changedPoint,
      status,
      currentPoint,
    });

    await manager.save(pointHistoryDao);

    return pointHistoryDao;
  }
  async createUserPoint(manager: EntityManager, userId: number, point: number): Promise<Point> {
    const userPointDao = manager.create(Point, { userId, point });
    await manager.save(userPointDao);
    return userPointDao;
  }
}
