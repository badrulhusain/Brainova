import { Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { StudentGuard } from '../../common/guards/student.guard';
import { SessionOwnerGuard } from '../../common/guards/session-owner.guard';
import { ScoringService } from './scoring.service';

@Controller('sessions')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post(':id/submit')
  @UseGuards(StudentGuard, SessionOwnerGuard)
  @HttpCode(HttpStatus.OK)
  submit(@Param('id') sessionId: string): Promise<{ resultId: string }> {
    return this.scoringService.scoreSession(sessionId);
  }
}
