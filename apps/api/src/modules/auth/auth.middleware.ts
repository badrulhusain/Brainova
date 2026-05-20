import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { getAuth } from './auth.config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, _next: NextFunction): void {
    // Pass the raw Express request/response directly to Better Auth.
    // This bypasses NestJS routing and the ResponseInterceptor intentionally —
    // Better Auth owns the full HTTP lifecycle for auth routes.
    toNodeHandler(getAuth())(req, res);
  }
}
