import { Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SessionOwnerGuard } from '../../common/guards/session-owner.guard';
import { ScoringService } from './scoring.service';

@Controller('sessions')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  /**
   * Manually submit a test session.
   * SessionOwnerGuard verifies that the session belongs to the authenticated user
   * before scoring begins. Double-submit protection is handled inside scoreSession().
   */
  @Post(':id/submit')
  @UseGuards(AuthGuard, SessionOwnerGuard)
  @HttpCode(HttpStatus.OK)
  submit(@Param('id') sessionId: string): Promise<{ resultId: string }> {
    return this.scoringService.scoreSession(sessionId);
  }
}
