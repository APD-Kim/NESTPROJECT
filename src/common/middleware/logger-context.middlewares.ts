import { Inject, Injectable, Logger, LoggerService, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly jwt: JwtService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    cookieParser()(req, res, () => {});
    const { ip, method, originalUrl, cookies } = req;
    const userAgent = req.get('user-agent');
    const token: string = req.cookies.authorization ? req.cookies.authorization : null;
    const tokenWithoutBearer = token ? token.replace('Bearer ', '') : null;
    const payload = tokenWithoutBearer ? this.jwt.decode(tokenWithoutBearer) : null;
    const userId = payload ? payload.userId : 0;
    const datetime = new Date();
    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(`${datetime} USER-${userId} ${method} ${originalUrl} ${statusCode} ${ip} ${userAgent}`);
    });

    next();
  }
}
