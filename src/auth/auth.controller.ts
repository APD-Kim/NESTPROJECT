import {
  Body,
  Controller,
  Get,
  Logger,
  ParseIntPipe,
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
import { ValidEmailDto } from './dto/eamil.dto';
import { winstonLogger } from 'src/utils/winston.config';

@Controller('auth')
export class AuthController {
  logger = winstonLogger;
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
    return await this.authService.userProfile(user);
  }
  @Post('valid')
  @UseGuards(AuthGuard('jwt'))
  async validEmail(@GetUser() user: User, @Body() validEmailDto: ValidEmailDto) {
    console.log(user);
    this.logger.verbose('valid 메서드 실행중');
    return await this.authService.sendValidNumber(validEmailDto, user);
  }
}
