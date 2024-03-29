import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { EntityManager, Repository, Transaction, getManager } from 'typeorm';
import { CreateUserCredentialDto } from './dto/create_user.dto';
import _ from 'lodash';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Point } from '../point/entity/point.entity';
import { PointHistory } from '../point/entity/point.history.entity';
import { PointHistoryStatus } from '../point/point-history-status-enum';
import { PointService } from '../point/point.service';
import { ValidEmailDto } from './dto/eamil.dto';
import { Queue } from 'bull';
import { ReservationProcessor } from './bull.processor';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private pointService: PointService,
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectQueue('valid')
    private queue: Queue,
  ) {}
  async createUser(createUserCredentialDto: CreateUserCredentialDto): Promise<User> {
    const { username, password } = createUserCredentialDto;
    const hashedPassowrd: string = await hash(password, 10);

    const foundUser: User = await this.userRepository.findOneBy({ username });

    if (!_.isNil(foundUser)) {
      throw new ConflictException(`${username}는 이미 존재하는 아이디입니다.`);
    }
    const transactionResult = await this.entityManager.transaction(async (manager) => {
      const initialPoint = 1000000;
      const createdUserDao: User = manager.create(User, {
        username,
        password: hashedPassowrd,
      });
      const user: User = await manager.save(createdUserDao);
      await this.pointService.createUserPoint(manager, user.userId, initialPoint);
      await this.pointService.createPointHistory(
        manager,
        user.userId,
        initialPoint,
        PointHistoryStatus.addPoint,
        initialPoint,
      );

      return user;
    });
    return transactionResult;
  }

  async logIn(createUserCredentialDto: CreateUserCredentialDto): Promise<{ accessToken }> {
    const { username, password } = createUserCredentialDto;
    const user = await this.userRepository.findOne({ where: { username }, select: ['username', 'password', 'userId'] });
    if (user && (await compare(password, user.password))) {
      const payload = { userId: user.userId };
      const token: string = await this.jwtService.sign(payload, { expiresIn: 1000 * 60 * 60 });
      return { accessToken: token };
    } else {
      throw new UnauthorizedException('아이디 또는 비밀번호를 다시 확인하세요');
    }
  }

  async findUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (_.isNil(user)) {
      throw new NotFoundException(`유저 이름이 ${username}인 유저를 찾을 수 없습니다.`);
    }
    return user;
  }

  async userProfile(user: User) {
    const { pointHistory, ...rest } = user;
    let total = 0;
    pointHistory.map((history) => {
      if (history.status === PointHistoryStatus.addPoint) {
        total += history.changedPoint;
      } else {
        total -= history.changedPoint;
      }
    });
    return { rest, point: total };
  }
  //이메일 인증코드 전송하기
  async sendValidNumber(validEmailDto: ValidEmailDto, user: User) {
    const { email } = validEmailDto;
    const jobData = {
      email,
      user,
    };
    this.queue.add('valid', jobData, { removeOnComplete: true });
    return { message: '이메일 전송 완료' };
  }
}
