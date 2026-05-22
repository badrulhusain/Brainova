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
  AdminModelName,
  StudentModelName,
  serialize,
  type Admin,
  type MongoModel,
  type Student,
} from '../../database/mongo.schemas';
import { extractBearerToken } from './auth.guard';

interface AnyTokenPayload extends jwt.JwtPayload {
  role?: 'STUDENT' | 'ADMIN';
  studentId?: string;
  adminId?: string;
}

@Injectable()
export class AnyUserGuard implements CanActivate {
  constructor(
    @InjectModel(StudentModelName)
    private readonly studentModel: MongoModel<Student>,
    @InjectModel(AdminModelName)
    private readonly adminModel: MongoModel<Admin>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();

    const token = extractBearerToken(request);
    if (!token) throw new UnauthorizedException('Authentication required');

    let payload: AnyTokenPayload;
    try {
      payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('JWT_SECRET'),
      ) as AnyTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.role === 'STUDENT') {
      const id = payload.studentId ?? payload.sub;
      if (!id) throw new UnauthorizedException('Invalid token');
      const doc = await this.studentModel.findById(id);
      const student = doc ? serialize<Student>(doc) : null;
      if (!student || !student.active) {
        throw new UnauthorizedException('Student not found or inactive');
      }
      request.user = student;
    } else if (payload.role === 'ADMIN') {
      const id = payload.adminId ?? payload.sub;
      if (!id) throw new UnauthorizedException('Invalid token');
      const doc = await this.adminModel.findById(id).select('-password');
      const admin = doc ? serialize<Omit<Admin, 'password'>>(doc) : null;
      if (!admin) throw new UnauthorizedException('Admin not found');
      request.user = admin;
    } else {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
