import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { AnyUserGuard } from '../../common/guards/any-user.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ResultsService } from './results.service';

const AdminResultsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

type AdminResultsQuery = z.infer<typeof AdminResultsQuerySchema>;

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('admin/all')
  @UseGuards(AdminGuard)
  findAllForAdmin(
    @Query(new ZodValidationPipe(AdminResultsQuerySchema)) query: AdminResultsQuery,
  ) {
    return this.resultsService.findAllForAdmin(query.page, query.limit);
  }

  @Get('admin/:id')
  @UseGuards(AdminGuard)
  findOneForAdmin(@Param('id') id: string) {
    return this.resultsService.findByIdForAdmin(id);
  }

  @Get(':id')
  @UseGuards(AnyUserGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.resultsService.findById(id, user.id);
  }

  @Get(':id/summary')
  @UseGuards(AnyUserGuard)
  summary(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.resultsService.findSummary(id, user.id);
  }
}
