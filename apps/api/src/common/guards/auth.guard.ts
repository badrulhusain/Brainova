import { Injectable } from '@nestjs/common';
import { StudentGuard, extractBearerToken } from './student.guard';

@Injectable()
export class AuthGuard extends StudentGuard {}

export { extractBearerToken };
