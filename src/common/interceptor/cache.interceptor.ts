import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache: Map<string, any> = new Map();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // GET /movie
    const key = `${request.method}- ${request.path}`;

    if (this.cache.has(key)) return of(this.cache.get(key));

    return next.handle().pipe(tap((response) => this.cache.set(key, response)));
  }
}
