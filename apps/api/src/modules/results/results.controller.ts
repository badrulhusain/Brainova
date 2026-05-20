import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResultsService } from './results.service';

@Controller('results')
@UseGuards(AuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  /**
   * Full result with question review.
   * Includes correctAnswer + explanation for every question.
   * Ownership is enforced in the service (userId check → 404 if mismatch).
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.resultsService.findById(id, user.id);
  }

  /**
   * Score-card only — no question detail.
   * Safe to display on a results list page without exposing answer keys.
   */
  @Get(':id/summary')
  summary(@Param('id') id: string, @CurrentUser() user: User) {
    return this.resultsService.findSummary(id, user.id);
  }
}
