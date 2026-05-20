import { Injectable, NotFoundException } from '@nestjs/common';
import type { Role, TestConfig } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { CreateTestConfigDto } from './dto/create-test-config.dto';
import type { UpdateTestConfigDto } from './dto/update-test-config.dto';

type TestConfigWithDomain = TestConfig & {
  domain: { id: string; name: string; icon: string };
};

const DOMAIN_SELECT = { select: { id: true, name: true, icon: true } } as const;

@Injectable()
export class TestConfigsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(role: Role): Promise<TestConfigWithDomain[]> {
    return this.prisma.testConfig.findMany({
      where: role === 'ADMIN' ? {} : { active: true },
      include: { domain: DOMAIN_SELECT },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, role: Role): Promise<TestConfigWithDomain> {
    const config = await this.prisma.testConfig.findUnique({
      where: { id },
      include: { domain: DOMAIN_SELECT },
    });

    if (!config) throw new NotFoundException('Test configuration not found');

    // Non-admins cannot view inactive configs
    if (role !== 'ADMIN' && !config.active) {
      throw new NotFoundException('Test configuration not found');
    }

    return config;
  }

  async create(dto: CreateTestConfigDto, userId: string): Promise<TestConfigWithDomain> {
    // Verify domain exists
    const domain = await this.prisma.domain.findUnique({ where: { id: dto.domainId } });
    if (!domain) throw new NotFoundException('Domain not found');

    return this.prisma.testConfig.create({
      data: { ...dto, createdBy: userId },
      include: { domain: DOMAIN_SELECT },
    });
  }

  async update(
    id: string,
    dto: UpdateTestConfigDto,
    _userId: string,
  ): Promise<TestConfigWithDomain> {
    const existing = await this.prisma.testConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Test configuration not found');

    return this.prisma.testConfig.update({
      where: { id },
      data: dto,
      include: { domain: DOMAIN_SELECT },
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.testConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Test configuration not found');

    // Soft-delete: preserve FK integrity for existing sessions that reference this config
    await this.prisma.testConfig.update({
      where: { id },
      data: { active: false },
    });
  }
}
