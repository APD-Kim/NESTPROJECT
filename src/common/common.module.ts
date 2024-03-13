import { Global, Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoggerContextMiddleware } from './middleware/logger-context.middlewares';
import { ExceptionsFilter } from './filters/exception.filter';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [Logger],
  exports: [Logger],
})
export class CommonModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerContextMiddleware).forRoutes('*');
  }
  //모든 라우트에 대해서 해당 미들웨어를 적용함
  
}
