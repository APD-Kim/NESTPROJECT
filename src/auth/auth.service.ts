import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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
    console.log(1);
    const { username, password } = createUserCredentialDto;
    const hashedPassowrd: string = await hash(password, 10);
    console.log(1);
    const foundUser: User = await this.userRepository.findOneBy({ username });
    console.log(2);
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
      console.log(user);
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
    console.log(3);
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

  async sendValidNumber(validEmailDto: ValidEmailDto, user: User) {
    const { email } = validEmailDto;
    const jobData = {
      email,
      user,
    };
    this.queue.add('valid', jobData, { removeOnComplete: true });
    return { message: '이메일 전송 완료' };
    //이미 이메일 유효성 검사는 통과했으니 바로 이메일 보내주면 됨 //완료
    // 이메일에 인증 코드를 보내줬을 때, 해당 유저의 아이디와 이메일을 레디스에 인증코드로 저장해두고,
    // 다른 메서드에서 해당 인증코드를 body에 담아 보내줬을 때, 해당 인증코드를 redis에서 찾고, 일치하는 값이 있다면
    // 해당 인증코드의 value값을 꺼내 해당 유저 아이디로 이메일과 isValid를 추가해줌
  }
}
