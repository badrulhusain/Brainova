import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { SCORING_SERVICE_TOKEN } from '../sessions/sessions.scheduler';

@Module({
  controllers: [ScoringController],
  providers: [
    ScoringService,
    // Register ScoringService under the opaque token that SessionsScheduler
    // uses via @Inject(SCORING_SERVICE_TOKEN) + @Optional().
    // When SessionsModule imports ScoringModule, the scheduler automatically
    // receives the real service and scores expired sessions on every cron tick.
    { provide: SCORING_SERVICE_TOKEN, useExisting: ScoringService },
  ],
  exports: [ScoringService, SCORING_SERVICE_TOKEN],
})
export class ScoringModule {}
