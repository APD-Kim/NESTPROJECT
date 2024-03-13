import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { LoggerService } from './logger/logger.service';
import { HttpLoggingInterceptor } from './common/logging-interceptor';
import { winstonLogger } from './utils/winston.config';
import { ExceptionsFilter } from './common/filters/exception.filter';
import { setupSwagger } from './utils/swagger';

async function bootstrap() {
  const logger = winstonLogger;
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: winstonLogger,
    //여기서 버퍼로그를 사용하는 이유는 구동 초반에 내장 로거를 쓸 수도 있기 때문
  });
  setupSwagger(app);
  app.useGlobalInterceptors(new HttpLoggingInterceptor(new LoggerService()));
  app.use(cookieParser());
  app.useGlobalFilters(new ExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  const port = 3000;
  await app.listen(port);
  logger.log(`${port}번 포트에서 어플리케이션 실행`);
}
bootstrap();
