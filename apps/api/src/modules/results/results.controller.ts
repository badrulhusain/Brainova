import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnyUserGuard } from '../../common/guards/any-user.guard';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ResultsService } from './results.service';

@Controller('results')
@UseGuards(AnyUserGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.resultsService.findById(id, user.id);
  }

  @Get(':id/summary')
  summary(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.resultsService.findSummary(id, user.id);
  }
}
