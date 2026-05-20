import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { TestConfigsModule } from './modules/test-configs/test-configs.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { ResultsModule } from './modules/results/results.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    TaxonomyModule,
    QuestionsModule,
    TestConfigsModule,
    SessionsModule,
    ScoringModule,
    ResultsModule,
    AnalyticsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Better Auth handles all /api/auth/* routes via Express middleware
    // This bypasses NestJS routing and interceptors for auth endpoints
    consumer
      .apply(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./modules/auth/auth.middleware').AuthMiddleware,
      )
      .forRoutes({ path: 'api/auth*', method: RequestMethod.ALL });
  }
}
