import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminModelName,
  AdminSchema,
  AptitudeQuestionModelName,
  AptitudeQuestionSchema,
  AptitudeResultModelName,
  AptitudeResultSchema,
  AnswerKeyModelName,
  AnswerKeySchema,
  DomainModelName,
  DomainSchema,
  QuestionModelName,
  QuestionSchema,
  StudentModelName,
  StudentSchema,
  SubtopicModelName,
  SubtopicSchema,
  TestAttemptModelName,
  TestAttemptSchema,
  TestConfigModelName,
  TestConfigSchema,
  TestResultModelName,
  TestResultSchema,
  TestSessionModelName,
  TestSessionSchema,
  TopicModelName,
  TopicSchema,
} from './mongo.schemas';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: StudentModelName, schema: StudentSchema },
      { name: AdminModelName, schema: AdminSchema },
      { name: DomainModelName, schema: DomainSchema },
      { name: TopicModelName, schema: TopicSchema },
      { name: SubtopicModelName, schema: SubtopicSchema },
      { name: QuestionModelName, schema: QuestionSchema },
      { name: AnswerKeyModelName, schema: AnswerKeySchema },
      { name: TestConfigModelName, schema: TestConfigSchema },
      { name: TestSessionModelName, schema: TestSessionSchema },
      { name: TestResultModelName, schema: TestResultSchema },
      { name: TestAttemptModelName, schema: TestAttemptSchema },
      { name: AptitudeQuestionModelName, schema: AptitudeQuestionSchema },
      { name: AptitudeResultModelName, schema: AptitudeResultSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class MongoDatabaseModule {}
