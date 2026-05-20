import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { PrismaClient } from '@prisma/client';

export type BetterAuthInstance = ReturnType<typeof betterAuth>;

let _auth: BetterAuthInstance | null = null;

export type VerificationEmailFn = (params: {
  user: { email: string; name?: string | null };
  url: string;
}) => Promise<void>;

// Replaced by EmailService in Phase 8
let _sendVerificationEmail: VerificationEmailFn = async ({ url }) => {
  console.log(`[Auth] Email verification URL: ${url}`);
};

export function setVerificationEmailFn(fn: VerificationEmailFn): void {
  _sendVerificationEmail = fn;
}

export function initAuth(prisma: PrismaClient): BetterAuthInstance {
  // Proxy maps Better Auth's internal 'session' model name to our 'authSession' Prisma model
  const db = new Proxy(prisma as unknown as Record<string | symbol, unknown>, {
    get(target, prop) {
      if (prop === 'session') {
        return Reflect.get(target, 'authSession');
      }
      return Reflect.get(target, prop);
    },
  });

  _auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
    database: prismaAdapter(db as unknown as PrismaClient, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await _sendVerificationEmail({
          user: { email: user.email, name: user.name ?? null },
          url,
        });
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
  });

  return _auth;
}

export function getAuth(): BetterAuthInstance {
  if (!_auth) {
    throw new Error('Better Auth not initialized. Ensure AuthModule is loaded before any request.');
  }
  return _auth;
}
