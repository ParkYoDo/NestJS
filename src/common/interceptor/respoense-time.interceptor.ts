import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    // 요청
    const request = context.switchToHttp().getRequest();
    const reqTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        //응답
        const resTime = Date.now();
        const diff = resTime - reqTime;

        // if (diff > 1000) {
        //   console.log(
        //     `!!! TIMEOUT!!! [${request.method}] ${request.path} ${diff}ms`,
        //   );

        //   throw new InternalServerErrorException(
        //     '시간이 너무 오래 걸렸습니다!',
        //   );
        // } else {
        console.log(`[${request.method}] ${request.path} ${diff}ms`);
        // }
      }),
    );
  }
}
