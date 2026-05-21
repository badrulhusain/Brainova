import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

// @Global() makes EmailService injectable everywhere without explicit imports.
// AuthModule uses it for Better Auth's verification callback;
// ScoringService can inject it directly to send result emails.
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
