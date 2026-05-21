import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { initAuth, setVerificationEmailFn } from './auth.config';
import { AuthMiddleware } from './auth.middleware';

@Module({
  providers: [AuthMiddleware],
  exports: [AuthMiddleware],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    // EmailService is available globally (EmailModule is @Global).
    // Injected here to wire it into the Better Auth verification callback.
    private readonly emailService: EmailService,
  ) {}

  onModuleInit(): void {
    // 1. Create the Better Auth singleton
    initAuth(this.prisma);

    // 2. Replace the no-op verification stub with the real EmailService.
    //    Better Auth reads _sendVerificationEmail at call time (closure),
    //    so setting it after initAuth() works correctly.
    setVerificationEmailFn(async ({ user, url }) => {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name ?? user.email,
        url,
      );
    });
  }
}
