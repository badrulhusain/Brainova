import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TaxonomyService } from './taxonomy.service';
import { CreateDomainSchema, type CreateDomainDto } from './dto/create-domain.dto';
import { CreateTopicSchema, type CreateTopicDto } from './dto/create-topic.dto';
import { CreateSubtopicSchema, type CreateSubtopicDto } from './dto/create-subtopic.dto';

@Controller('domains')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  // ── Domains ──────────────────────────────────────────────────────────────

  @Get()
  findAllDomains() {
    return this.taxonomyService.findAllDomains();
  }

  @Post()
  @UseGuards(AdminGuard)
  createDomain(
    @Body(new ZodValidationPipe(CreateDomainSchema)) dto: CreateDomainDto,
  ) {
    return this.taxonomyService.createDomain(dto);
  }

  // ── Topics ────────────────────────────────────────────────────────────────

  @Get(':id/topics')
  findTopics(@Param('id') domainId: string) {
    return this.taxonomyService.findTopicsByDomain(domainId);
  }

  @Post(':domainId/topics')
  @UseGuards(AdminGuard)
  createTopic(
    @Param('domainId') domainId: string,
    @Body(new ZodValidationPipe(CreateTopicSchema)) dto: CreateTopicDto,
  ) {
    return this.taxonomyService.createTopic(domainId, dto);
  }

  // ── Subtopics ─────────────────────────────────────────────────────────────

  @Post(':domainId/topics/:topicId/subtopics')
  @UseGuards(AdminGuard)
  createSubtopic(
    @Param('domainId') domainId: string,
    @Param('topicId') topicId: string,
    @Body(new ZodValidationPipe(CreateSubtopicSchema)) dto: CreateSubtopicDto,
  ) {
    return this.taxonomyService.createSubtopic(domainId, topicId, dto);
  }
}
