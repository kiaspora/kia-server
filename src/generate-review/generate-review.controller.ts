import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';

import { BearerTokenGuard } from '../auth/bearer-token.guard';
import type { TraceRequest } from '../common/trace-id.middleware';
import {
  GenerateReviewDto,
  validateGenerateReviewDto,
} from './dto/generate-review.dto';
import {
  GenerateReviewService,
  type ReviewResult,
} from './generate-review.service';

type GenerateReviewEnvelope = {
  statusCode: number;
  errors: string[];
  latency: number;
  data: ReviewResult | null;
  traceId: string;
};

@Controller('api/justus')
@UseGuards(BearerTokenGuard)
export class GenerateReviewController {
  constructor(private readonly generateReviewService: GenerateReviewService) {}

  @Post('generateReview')
  async generateReview(
    @Req() req: TraceRequest,
    @Body() body: GenerateReviewDto,
  ): Promise<GenerateReviewEnvelope> {
    const started = Date.now();
    const traceId = this.resolveTraceId(req);
    const validation = validateGenerateReviewDto(body);

    if (!validation.value) {
      return {
        statusCode: 400,
        errors: validation.errors,
        latency: Date.now() - started,
        data: null,
        traceId,
      };
    }

    const serviceResult = await this.generateReviewService.generateReview(validation.value, {
      traceId,
      authorization: this.getAuthorization(req),
      baseUrl: this.resolveBaseUrl(req),
      userKey: this.resolveUserKey(req),
    });

    return {
      statusCode: serviceResult.statusCode,
      errors: serviceResult.errors,
      latency: Date.now() - started,
      data: serviceResult.data,
      traceId,
    };
  }

  private resolveTraceId(req: TraceRequest): string {
    return (
      req.traceId ||
      (req.header('x-trace-id') || req.header('X-Trace-Id') || '').trim() ||
      randomUUID()
    );
  }

  private resolveBaseUrl(req: Request): string {
    const configured = process.env.SERVER_BASE_URL;
    if (configured && configured.trim()) return configured.replace(/\/+$/, '');

    const protocol =
      (req.header('x-forwarded-proto') || '').split(',')[0]?.trim() || req.protocol || 'http';
    const host =
      (req.header('x-forwarded-host') || '').split(',')[0]?.trim() ||
      req.get('host') ||
      req.headers.host ||
      'localhost:3000';

    return `${protocol}://${host}`.replace(/\/+$/, '');
  }

  private getAuthorization(req: Request): string | undefined {
    const raw =
      (req.headers.authorization as string | undefined) ||
      (req.headers.Authorization as string | undefined);
    return raw && raw.trim() ? raw.trim() : undefined;
  }

  private resolveUserKey(req: Request): string {
    const header =
      (req.header('x-user-id') || req.header('X-User-Id') || req.header('x-user-key') || '')
        .trim();
    return header || 'global';
  }
}
