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
  serialize,
  type Admin,
  type MongoModel,
} from '../../database/mongo.schemas';
import { extractBearerToken } from './auth.guard';

interface AdminTokenPayload extends jwt.JwtPayload {
  adminId?: string;
  role: 'ADMIN';
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectModel(AdminModelName)
    private readonly adminModel: MongoModel<Admin>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { admin?: unknown; user?: unknown }>();

    const token = extractBearerToken(request);
    if (!token) throw new UnauthorizedException('Authentication required');

    let payload: AdminTokenPayload;
    try {
      payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('JWT_SECRET'),
      ) as AdminTokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const adminId = payload.adminId ?? payload.sub;
    if (payload.role !== 'ADMIN' || !adminId) {
      throw new UnauthorizedException('Admin authentication required');
    }

    const adminDoc = await this.adminModel.findById(adminId).select('username createdAt');
    const admin = adminDoc ? serialize<Omit<Admin, 'password'>>(adminDoc) : null;

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    request.admin = admin;
    request.user = admin;
    return true;
  }
}
