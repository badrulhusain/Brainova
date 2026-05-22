import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type AppEnv = z.infer<typeof envSchema>;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config: Record<string, unknown>): AppEnv => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          const message = result.error.errors
            .map((error) => `${error.path.join('.')}: ${error.message}`)
            .join('; ');
          throw new Error(`Invalid environment configuration: ${message}`);
        }
        return result.data;
      },
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
