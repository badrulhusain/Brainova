import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { User } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AnalyticsService } from './analytics.service';

const AttemptsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  domainId: z.string().optional(),
});

type AttemptsQuery = z.infer<typeof AttemptsQuerySchema>;

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** Total tests, avg score, best score, overall accuracy */
  @Get('summary')
  getSummary(@CurrentUser() user: User) {
    return this.analyticsService.getSummary(user.id);
  }

  /** Paginated attempt history. Optional: ?domainId=&page=&limit= */
  @Get('attempts')
  getAttempts(
    @CurrentUser() user: User,
    @Query(new ZodValidationPipe(AttemptsQuerySchema)) query: AttemptsQuery,
  ) {
    return this.analyticsService.getAttempts(
      user.id,
      query.page,
      query.limit,
      query.domainId,
    );
  }

  /** Last 20 attempts in chronological order for a line chart */
  @Get('score-trend')
  getScoreTrend(@CurrentUser() user: User) {
    return this.analyticsService.getScoreTrend(user.id);
  }

  /** Top 3 weakest topics by accuracy across all attempts */
  @Get('weak-topics')
  getWeakTopics(@CurrentUser() user: User) {
    return this.analyticsService.getWeakTopics(user.id);
  }

  /** Accuracy % broken down by EASY / MEDIUM / HARD */
  @Get('difficulty-chart')
  getDifficultyChart(@CurrentUser() user: User) {
    return this.analyticsService.getDifficultyChart(user.id);
  }
}
