import { Global, Module, Logger } from '@nestjs/common';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
});

export type AppEnv = z.infer<typeof envSchema>;

export const APP_ENV = Symbol('APP_ENV');

@Global()
@Module({
  providers: [
    {
      provide: APP_ENV,
      useFactory: (): AppEnv => {
        const result = envSchema.safeParse(process.env);
        if (!result.success) {
          const logger = new Logger('ConfigModule');
          logger.error('Invalid environment variables:');
          result.error.errors.forEach((e) =>
            logger.error(`  ${e.path.join('.')}: ${e.message}`),
          );
          process.exit(1);
        }
        return result.data;
      },
    },
  ],
  exports: [APP_ENV],
})
export class AppConfigModule {}
