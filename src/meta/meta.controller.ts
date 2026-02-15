import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('meta')
@Controller()
export class MetaController {
  @Get('status')
  @ApiOkResponse({
    schema: {
      example: { ok: true, service: 'api', timestamp: '2026-02-15T00:00:00.000Z' },
    },
  })
  status() {
    return { ok: true, service: 'api', timestamp: new Date().toISOString() };
  }

  @Get('about')
  @ApiOkResponse({
    schema: {
      example: { name: 'api', description: 'NestJS service deployed on Railway', version: '0.0.0' },
    },
  })
  about() {
    return {
      name: 'api',
      description: 'NestJS service deployed on Railway',
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}
