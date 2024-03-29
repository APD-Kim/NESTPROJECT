import { Injectable, Req, Request, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Repository } from 'typeorm';
import _ from 'lodash';
import { Request as RequestType } from 'express';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false, 
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'authorization' in req.cookies && req.cookies.authorization.length > 0) {
      return req.cookies.authorization.split(' ')[1];
    }
    return null;
  }

  async validate(payload) {
    console.log(payload);
    const { userId } = payload;
    const user: User = await this.userRepository.findOne({ where: { userId }, relations: ['pointHistory'] });

    if (_.isNil(user)) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
