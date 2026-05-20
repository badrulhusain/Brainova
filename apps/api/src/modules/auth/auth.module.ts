import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { initAuth } from './auth.config';
import { AuthMiddleware } from './auth.middleware';

@Module({
  providers: [AuthMiddleware],
  exports: [AuthMiddleware],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    // Initialize the Better Auth singleton using our PrismaService instance.
    // Must run before any HTTP request reaches the AuthGuard or AuthMiddleware.
    initAuth(this.prisma);
  }
}
