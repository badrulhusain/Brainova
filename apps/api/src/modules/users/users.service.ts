import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { z } from 'zod';
import { PrismaService } from '../../database/prisma.service';

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }
}
