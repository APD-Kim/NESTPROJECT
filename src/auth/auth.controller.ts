import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserCredentialDto } from './dto/create_user.dto';
import { User } from '../user/entity/user.entity';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  logger = new Logger();
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body(ValidationPipe) createUserCredentialDto: CreateUserCredentialDto): Promise<User> {
    this.logger.verbose('signup 메서드 실행');
    return await this.authService.createUser(createUserCredentialDto);
  }

  @Post('/login')
  async logIn(
    @Body(ValidationPipe) createUserCredentialDto: CreateUserCredentialDto,
    @Res() response: Response,
  ): Promise<void> {
    const { accessToken } = await this.authService.logIn(createUserCredentialDto);
    if (accessToken) {
      const BearerToken = `Bearer ${accessToken}`;
      response.cookie('authorization', BearerToken, { maxAge: 1000 * 60 * 60 * 5, httpOnly: true, secure: true });
    } else {
      throw new UnauthorizedException();
    }
    response.status(200).json({ message: '로그인 성공' });
  }

  @Get('/profile')
  @UseGuards(RolesGuard)
  async getProfile(@GetUser() user: User) {
    this.logger.verbose('test메서드 실행중');
    return await this.authService.userProfile(user);
  }
}
