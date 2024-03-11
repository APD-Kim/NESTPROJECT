import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadGatewayException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now(); //현재 시간을 얻기 위해 사용됨
    console.log(`Before... ${Date.now() - now}ms`);

    return next.handle().pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)),

      map((responseData) => responseData),

    );
  }
}
