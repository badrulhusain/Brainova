import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AnyUserGuard } from '../../common/guards/any-user.guard';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AnalyticsService } from './analytics.service';

const AttemptsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  domainId: z.string().optional(),
});

type AttemptsQuery = z.infer<typeof AttemptsQuerySchema>;

@Controller('analytics')
@UseGuards(AnyUserGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getSummary(user.id);
  }

  @Get('attempts')
  getAttempts(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(AttemptsQuerySchema)) query: AttemptsQuery,
  ) {
    return this.analyticsService.getAttempts(user.id, query.page, query.limit, query.domainId);
  }

  @Get('score-trend')
  getScoreTrend(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getScoreTrend(user.id);
  }

  @Get('weak-topics')
  getWeakTopics(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getWeakTopics(user.id);
  }

  @Get('difficulty-chart')
  getDifficultyChart(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getDifficultyChart(user.id);
  }
}
