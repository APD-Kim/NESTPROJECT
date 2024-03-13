import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from 'src/logger/logger.service';
import { winstonLogger } from 'src/utils/winston.config';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}
  private logger = winstonLogger;

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const { method, original, query, param, body } = httpContext.getRequest();

    return next.handle().pipe(
      tap((data) =>
        this.logger.log(
          JSON.stringify({
            request: { method, original, query, param, body },
            response: { statusCode: httpContext.getResponse()?.statusCode, data },
          }),
        ),
      ),
    );
  }
}
