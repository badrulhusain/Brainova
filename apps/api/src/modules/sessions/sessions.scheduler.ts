import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';

// Token used to inject ScoringService without a hard import (avoids circular deps).
// ScoringModule registers { provide: SCORING_SERVICE_TOKEN, useExisting: ScoringService }
// when it is imported into SessionsModule in Phase 5.
export const SCORING_SERVICE_TOKEN = 'SCORING_SERVICE';

export interface IScoringService {
  scoreSession(sessionId: string): Promise<{ resultId: string }>;
}

@Injectable()
export class SessionsScheduler {
  private readonly logger = new Logger(SessionsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject(SCORING_SERVICE_TOKEN)
    private readonly scoringService: IScoringService | null,
  ) {}

  /**
   * Every 60 seconds: find all IN_PROGRESS sessions past their expiresAt,
   * then hand them off to ScoringService.scoreSession() which atomically
   * sets status = SCORING, computes results, and sets status = SUBMITTED.
   *
   * If ScoringService is not yet wired (Phase 4 standalone), sessions are
   * marked EXPIRED directly so they don't accumulate.
   */
  @Cron('* * * * *')
  async expireAndScoreSessions(): Promise<void> {
    const now = new Date();

    const expiring = await this.prisma.testSession.findMany({
      where: { status: 'IN_PROGRESS', expiresAt: { lt: now } },
      select: { id: true },
    });

    if (expiring.length === 0) return;

    this.logger.log(`Expiring ${expiring.length} session(s)...`);

    for (const { id } of expiring) {
      try {
        if (this.scoringService) {
          // ScoringService handles the full state transition: IN_PROGRESS → SCORING → SUBMITTED
          await this.scoringService.scoreSession(id);
        } else {
          // Fallback until Phase 5 wires ScoringService
          await this.prisma.testSession.update({
            where: { id },
            data: { status: 'EXPIRED' },
          });
          this.logger.warn(`Session ${id} marked EXPIRED (ScoringService not yet available)`);
        }
      } catch (err) {
        this.logger.error(`Failed to expire/score session ${id}:`, err);
      }
    }
  }
}
