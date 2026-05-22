import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import {
  AdminModelName,
  serialize,
  serializeMany,
  type Admin,
  type MongoModel,
} from '../../database/mongo.schemas';
import type { CreateAdminDto } from './dto/create-admin.dto';

export type PublicAdmin = Omit<Admin, 'password'>;

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(AdminModelName)
    private readonly adminModel: MongoModel<Admin>,
  ) {}

  async findAll(): Promise<PublicAdmin[]> {
    const docs = await this.adminModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 });
    return serializeMany<PublicAdmin>(docs);
  }

  async create(dto: CreateAdminDto): Promise<PublicAdmin> {
    const existing = await this.adminModel.exists({ username: dto.username.trim() });
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const doc = await this.adminModel.create({
      username: dto.username.trim(),
      password: hashed,
    });
    const { password: _pw, ...rest } = serialize<Admin>(doc);
    return rest as PublicAdmin;
  }

  async remove(id: string, requestingAdminId: string): Promise<{ deleted: true }> {
    if (id === requestingAdminId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const doc = await this.adminModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Admin not found');

    return { deleted: true };
  }
}
