import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import {
  TestSessionModelName,
  type MongoModel,
  type Student,
  type TestSession,
} from '../../database/mongo.schemas';

@Injectable()
export class SessionOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(TestSessionModelName)
    private readonly sessionModel: MongoModel<TestSession>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: Student }>();
    const sessionId = request.params['id'];
    const studentId = request.user?.id;

    if (!sessionId || !studentId) {
      throw new ForbiddenException('Access denied');
    }

    const session = await this.sessionModel.findById(sessionId).select('studentId');

    if (!session) {
      throw new NotFoundException('Test session not found');
    }

    if (session.studentId !== studentId) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
