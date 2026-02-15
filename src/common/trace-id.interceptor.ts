import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { TraceRequest } from './trace-id.middleware';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest<TraceRequest>();
    const traceId = req.traceId;

    return next.handle().pipe(
      map((data) => {
        if (!traceId) return data;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // don’t overwrite if already present
          if (!('traceId' in data)) return { ...data, traceId };
          return data;
        }

        // primitives / arrays => wrap so traceId is in the output
        return { traceId, data };
      }),
    );
  }
}
