import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PointService } from '../point/point.service';
import { InjectEntityManager, getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Point } from '../point/entity/point.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserCredentialDto } from './dto/create_user.dto';
import { string } from 'joi';

const mockUserRepository = () => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});
const userRepositoryMock = mockUserRepository();
const mockPointRepository = () => ({});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockPointService = () => ({
  createUserPoint: jest.fn(),
  createPointHistory: jest.fn(),
});
const pointServiceMock = mockPointService();

const mockEntityManager = () => ({
  transaction: jest.fn(),
});

const mockManager = {
  create: jest.fn().mockReturnValue({}),
  save: jest.fn().mockResolvedValue({
    userId: 24,
    email: null,
    username: 'lol0659867',
    isValid: false,
    isAdmin: true,
    createdAt: '2024-03-08T06:11:38.044Z',
    updatedAt: '2024-03-08T22:00:53.200Z',
    deletedAt: null,
  }),
  // 필요에 따라 다른 메서드들을 모킹
};

const entityManagerMock = mockEntityManager();
describe('AuthService', () => {
  let authService: AuthService;
  let pointService: PointService;
  let userRepository: Repository<User>;
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    entityManagerMock.transaction.mockImplementation(async (cb) => {
      await cb(mockManager);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useFactory: () => userRepositoryMock,
        },
        { provide: getRepositoryToken(Point), useFactory: mockPointRepository },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: PointService, useFactory: () => pointServiceMock },
        {
          provide: getEntityManagerToken(),
          useValue: entityManagerMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    pointService = module.get<PointService>(PointService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(pointService).toBeDefined();
  });

  describe('authService', () => {
    describe('createUser', () => {
      it('createUser method', async () => {
        const mockCreateUserCredentialDto: CreateUserCredentialDto = {
          username: 'lol0620',
          password: 'lol940620',
        };

        userRepositoryMock.findOneBy.mockResolvedValue(null);
        mockManager.save.mockResolvedValue({ userId: 1 });

        pointServiceMock.createUserPoint.mockResolvedValue(undefined);
        pointServiceMock.createPointHistory.mockResolvedValue(undefined);
        await authService.createUser(mockCreateUserCredentialDto);
        expect(userRepositoryMock.findOneBy).toHaveBeenCalledTimes(1);
        expect(userRepositoryMock.findOneBy).toHaveBeenCalledWith({ username: 'lol0620' });
        expect(pointServiceMock.createUserPoint).toHaveBeenCalledTimes(1);
        expect(pointServiceMock.createPointHistory).toHaveBeenCalledTimes(1);
        expect(mockManager.create).toHaveBeenCalledTimes(1);
        expect(mockManager.create).toHaveBeenCalledWith(User, {
          username: expect.any(String),
          password: expect.any(String),
        });
        expect(mockManager.save).toHaveBeenCalledTimes(1);
      });
    });
  });
});
