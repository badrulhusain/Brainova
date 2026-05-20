import { Injectable, NotFoundException } from '@nestjs/common';
import type { Domain, Subtopic, Topic } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { CreateDomainDto } from './dto/create-domain.dto';
import type { CreateTopicDto } from './dto/create-topic.dto';
import type { CreateSubtopicDto } from './dto/create-subtopic.dto';

export type TopicWithSubtopics = Topic & { subtopics: Subtopic[] };

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Domains ──────────────────────────────────────────────────────────────

  async findAllDomains(): Promise<Domain[]> {
    return this.prisma.domain.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
  }

  async createDomain(dto: CreateDomainDto): Promise<Domain> {
    return this.prisma.domain.create({ data: dto });
  }

  // ── Topics ────────────────────────────────────────────────────────────────

  async findTopicsByDomain(domainId: string): Promise<TopicWithSubtopics[]> {
    const domain = await this.prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain) throw new NotFoundException('Domain not found');

    return this.prisma.topic.findMany({
      where: { domainId, active: true },
      include: {
        subtopics: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createTopic(domainId: string, dto: CreateTopicDto): Promise<Topic> {
    const domain = await this.prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain) throw new NotFoundException('Domain not found');

    return this.prisma.topic.create({ data: { ...dto, domainId } });
  }

  // ── Subtopics ─────────────────────────────────────────────────────────────

  async createSubtopic(
    domainId: string,
    topicId: string,
    dto: CreateSubtopicDto,
  ): Promise<Subtopic> {
    const topic = await this.prisma.topic.findFirst({
      where: { id: topicId, domainId },
    });
    if (!topic) throw new NotFoundException('Topic not found in this domain');

    return this.prisma.subtopic.create({ data: { ...dto, topicId } });
  }
}
