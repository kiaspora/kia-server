import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const expected = process.env.API_BEARER_TOKEN;
    if (!expected) {
      // 500: server misconfigured
      throw new HttpException('Server misconfigured: API_BEARER_TOKEN missing', 500);
    }

    const req = ctx.switchToHttp().getRequest();
    const auth: string | undefined =
      req.headers?.authorization ?? req.headers?.Authorization;

    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = auth.slice('Bearer '.length).trim();
    if (token !== expected) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    return true;
  }
}
