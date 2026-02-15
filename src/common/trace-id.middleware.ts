import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

export type TraceRequest = Request & { traceId?: string };

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: TraceRequest, res: Response, next: NextFunction) {
    const incoming =
      (req.header('x-trace-id') ||
        req.header('trace-id') ||
        req.header('x-request-id'))?.trim() || '';

    const traceId = incoming && isUuid(incoming) ? incoming : randomUUID();

    req.traceId = traceId;
    res.setHeader('x-trace-id', traceId);

    next();
  }
}

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}
