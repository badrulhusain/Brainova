import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Admin } from '../../database/mongo.schemas';

export type SafeAdmin = Omit<Admin, 'password'>;

export interface AdminRequest extends Request {
  admin: SafeAdmin;
}

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SafeAdmin => {
    const request = ctx.switchToHttp().getRequest<AdminRequest>();
    return request.admin;
  },
);
