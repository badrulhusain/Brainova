import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { TestConfigsModule } from './modules/test-configs/test-configs.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { ResultsModule } from './modules/results/results.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminsModule } from './modules/admins/admins.module';
import { AptitudeModule } from './modules/aptitude/aptitude.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    StudentsModule,
    AdminsModule,
    TaxonomyModule,
    QuestionsModule,
    TestConfigsModule,
    SessionsModule,
    ScoringModule,
    ResultsModule,
    AptitudeModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
