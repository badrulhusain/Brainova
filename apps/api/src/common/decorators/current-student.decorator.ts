import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Student } from '../../database/mongo.schemas';

export interface StudentRequest extends Request {
  student: Student;
}

export const CurrentStudent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Student => {
    const request = ctx.switchToHttp().getRequest<StudentRequest>();
    return request.student;
  },
);
