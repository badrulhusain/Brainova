import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** Minimal interface satisfied by both Student and Admin models. */
export interface AuthUser {
  id: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthUser; student?: AuthUser }>();
    const user = request.student ?? request.user;
    return user as AuthUser;
  },
);
