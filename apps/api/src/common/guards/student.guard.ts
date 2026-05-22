import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import type { Request } from 'express';
import {
  serialize,
  StudentModelName,
  type MongoModel,
  type Student,
} from '../../database/mongo.schemas';

export interface StudentTokenPayload extends jwt.JwtPayload {
  studentId?: string;
  admissionNo?: string;
  role: 'STUDENT';
}

export function extractBearerToken(request: Request): string | null {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length).trim();
}

@Injectable()
export class StudentGuard implements CanActivate {
  constructor(
    @InjectModel(StudentModelName)
    private readonly studentModel: MongoModel<Student>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { student?: unknown; user?: unknown }>();
    const token = extractBearerToken(request);

    if (!token) throw new UnauthorizedException('Authentication required');

    let payload: StudentTokenPayload;
    try {
      payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('JWT_SECRET'),
      ) as StudentTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const studentId = payload.studentId ?? payload.sub;
    if (payload.role !== 'STUDENT' || !studentId) {
      throw new UnauthorizedException('Student authentication required');
    }

    const studentDoc = await this.studentModel.findById(studentId);
    const student = studentDoc ? serialize<Student>(studentDoc) : null;

    if (!student || !student.active) {
      throw new UnauthorizedException('Student not found or inactive');
    }

    request.student = student;
    request.user = student;
    return true;
  }
}
