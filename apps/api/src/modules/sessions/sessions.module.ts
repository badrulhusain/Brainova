import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionsGateway } from './sessions.gateway';
import { SessionsScheduler } from './sessions.scheduler';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  // ScoringModule provides SCORING_SERVICE_TOKEN, which activates full
  // scoreSession() behaviour inside SessionsScheduler's cron job.
  imports: [ScoringModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsGateway, SessionsScheduler],
  exports: [SessionsService],
})
export class SessionsModule {}
