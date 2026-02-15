import { Controller, Get } from '@nestjs/common';

@Controller()
export class MetaController {
  @Get('status')
  status() {
    return {
      ok: true,
      service: 'api',
      ts: new Date().toISOString(),
    };
  }

  @Get('about')
  about() {
    return {
      name: 'api',
      description: 'NestJS service deployed on Railway',
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}

