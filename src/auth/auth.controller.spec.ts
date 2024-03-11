import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { after } from 'lodash';
import { createResponse, createRequest } from 'node-mocks-http';
import exp from 'constants';
import { json } from 'stream/consumers';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity';

//유저 서비스 Mocking
const mockAuthService = {
  createUser: jest.fn(),
  logIn: jest.fn(),
  userProfile: jest.fn(),
};

const CreateUserCredentialDto = {
  username: 'kim0620',
  password: 'lol940620',
};

let response = createResponse();

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });
  afterAll(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('createUser', () => {
    it('success createUser Method', async () => {
      let mockReturn = 'sign-up complete';
      mockAuthService.createUser.mockResolvedValueOnce(mockReturn);
      await authController.signUp(CreateUserCredentialDto);
      expect(mockAuthService.createUser).toHaveBeenCalledTimes(1);
      expect(mockAuthService.createUser).toHaveBeenCalledWith(CreateUserCredentialDto);
    });
  });
  describe('logIn', () => {
    it('success logIn Method', async () => {
      const mockReturn = {
        accessToken: 'im cookie',
      };
      response.status = jest.fn().mockReturnThis();
      response.json = jest.fn();

      mockAuthService.logIn.mockResolvedValue(mockReturn);
      await authController.logIn(CreateUserCredentialDto, response);
      expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
      expect(mockAuthService.logIn).toHaveBeenCalledWith(CreateUserCredentialDto);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ message: '로그인 성공' });
    });
    it('failed logIn Method by accesstoken is missing', async () => {
      const mockReturn = {
        accessToken: null,
      };

      mockAuthService.logIn.mockResolvedValue(mockReturn);
      await expect(authController.logIn(CreateUserCredentialDto, response)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
      expect(mockAuthService.logIn).toHaveBeenCalledWith(CreateUserCredentialDto);
    });
  });
  describe('getProfile', () => {
    it('success getProfile method', async () => {
      const mockReturn = 'this is your profile';
      const mockUserData: User = {
        userId: 1,
        email: null,
        username: 'lol03545',
        password: 'lol940620',
        isValid: false,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        point: [],
        reservation: [],
        pointHistory: [],
      };

      mockAuthService.userProfile.mockResolvedValue(mockReturn);
      await authController.getProfile(mockUserData);
      expect(mockAuthService.userProfile).toHaveBeenCalledTimes(1);
      expect(mockAuthService.userProfile).toHaveBeenCalledWith(mockUserData);
    });
  });
});
