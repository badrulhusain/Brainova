import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AnswerKeyModelName,
  DomainModelName,
  QuestionModelName,
  serialize,
  serializeMany,
  TestConfigModelName,
  type AnswerKey,
  type Domain,
  type MongoModel,
  type Question,
  type TestConfig,
} from '../../database/mongo.schemas';
import { shuffleArray } from '../sessions/helpers/shuffle';
import type { CreateTestConfigDto } from './dto/create-test-config.dto';
import type { UpdateTestConfigDto } from './dto/update-test-config.dto';

type TestConfigWithDomain = TestConfig & {
  domain: { id: string; name: string; icon: string };
};

@Injectable()
export class TestConfigsService {
  constructor(
    @InjectModel(TestConfigModelName)
    private readonly configModel: MongoModel<TestConfig>,
    @InjectModel(DomainModelName)
    private readonly domainModel: MongoModel<Domain>,
    @InjectModel(QuestionModelName)
    private readonly questionModel: MongoModel<Question>,
    @InjectModel(AnswerKeyModelName)
    private readonly answerKeyModel: MongoModel<AnswerKey>,
  ) {}

  async findAll(): Promise<TestConfigWithDomain[]> {
    const configs = serializeMany<TestConfig>(
      await this.configModel.find({ active: true }).sort({ createdAt: -1 }),
    );
    return this.attachDomains(configs);
  }

  async findById(id: string): Promise<TestConfigWithDomain> {
    const config = await this.configModel.findOne({ _id: id, active: true });
    if (!config) throw new NotFoundException('Test configuration not found');
    const [withDomain] = await this.attachDomains([serialize<TestConfig>(config)]);
    return withDomain;
  }

  async create(dto: CreateTestConfigDto, adminId: string): Promise<TestConfigWithDomain> {
    const domain = await this.domainModel.exists({ _id: dto.domainId });
    if (!domain) throw new NotFoundException('Domain not found');

    const config = serialize<TestConfig>(
      await this.configModel.create({ ...dto, createdBy: adminId }),
    );
    const [withDomain] = await this.attachDomains([config]);
    return withDomain;
  }

  async update(id: string, dto: UpdateTestConfigDto): Promise<TestConfigWithDomain> {
    const config = await this.configModel.findByIdAndUpdate(id, dto, { new: true });
    if (!config) throw new NotFoundException('Test configuration not found');
    const [withDomain] = await this.attachDomains([serialize<TestConfig>(config)]);
    return withDomain;
  }

  async remove(id: string): Promise<void> {
    const config = await this.configModel.findByIdAndUpdate(id, { active: false });
    if (!config) throw new NotFoundException('Test configuration not found');
  }

  async previewQuestions(configId: string): Promise<{ config: TestConfigWithDomain; questions: Question[] }> {
    const raw = await this.configModel.findById(configId);
    if (!raw) throw new NotFoundException('Test configuration not found');
    const config = serialize<TestConfig>(raw);
    const [withDomain] = await this.attachDomains([config]);

    const topicFilter = config.topicFilter ?? [];
    const baseWhere = {
      domainId: config.domainId,
      active: true,
      ...(topicFilter.length > 0 && { topicId: { $in: topicFilter } }),
    };

    const [easyPool, mediumPool, hardPool] = await Promise.all([
      this.questionModel.find({ ...baseWhere, difficulty: 'EASY' }),
      this.questionModel.find({ ...baseWhere, difficulty: 'MEDIUM' }),
      this.questionModel.find({ ...baseWhere, difficulty: 'HARD' }),
    ]);

    const selected = [
      ...shuffleArray(serializeMany<Question>(easyPool)).slice(0, config.easyCount),
      ...shuffleArray(serializeMany<Question>(mediumPool)).slice(0, config.mediumCount),
      ...shuffleArray(serializeMany<Question>(hardPool)).slice(0, config.hardCount),
    ];

    const questions = (config.shuffleQuestions ? shuffleArray(selected) : selected).map((q) => ({
      ...q,
      options: config.shuffleOptions ? shuffleArray(q.options) : q.options,
    }));

    return { config: withDomain, questions };
  }

  async previewScore(
    questionIds: string[],
    answers: Record<string, string>,
    marksPerQuestion: number,
    negativeMarksRatio: number,
  ): Promise<{
    scoredMarks: number;
    totalMarks: number;
    percentageScore: number;
    accuracy: number;
    results: Array<{
      questionId: string;
      userAnswer: string | null;
      correctAnswer: string;
      explanation: string;
      isCorrect: boolean;
      marks: number;
    }>;
  }> {
    const answerKeys = serializeMany<AnswerKey>(
      await this.answerKeyModel.find({ questionId: { $in: questionIds } }),
    );
    const keyMap = new Map(answerKeys.map((k) => [k.questionId, k]));
    const negativeMarks = marksPerQuestion * negativeMarksRatio;

    let runningMarks = 0;
    let correctCount = 0;
    let attemptedCount = 0;
    const results = questionIds.map((qId) => {
      const key = keyMap.get(qId);
      const userAnswer = answers[qId] ?? null;
      const correctAnswer = key?.correctAnswer ?? '';
      const isCorrect = Boolean(userAnswer) && userAnswer === correctAnswer;
      const isIncorrect = Boolean(userAnswer) && userAnswer !== correctAnswer;
      const marks = isCorrect ? marksPerQuestion : isIncorrect ? -negativeMarks : 0;

      runningMarks += marks;
      if (isCorrect) correctCount++;
      if (Boolean(userAnswer)) attemptedCount++;

      return {
        questionId: qId,
        userAnswer,
        correctAnswer,
        explanation: key?.explanation ?? '',
        isCorrect,
        marks,
      };
    });

    const scoredMarks = Math.max(0, runningMarks);
    const totalMarks = questionIds.length * marksPerQuestion;
    return {
      scoredMarks,
      totalMarks,
      percentageScore: totalMarks > 0 ? (scoredMarks / totalMarks) * 100 : 0,
      accuracy: attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0,
      results,
    };
  }

  private async attachDomains(configs: TestConfig[]): Promise<TestConfigWithDomain[]> {
    const domainIds = [...new Set(configs.map((config) => config.domainId))];
    const domains = serializeMany<Domain>(await this.domainModel.find({ _id: { $in: domainIds } }));
    const domainMap = new Map(domains.map((domain) => [domain.id, domain]));

    return configs.map((config) => {
      const domain = domainMap.get(config.domainId);
      return {
        ...config,
        domain: {
          id: domain?.id ?? config.domainId,
          name: domain?.name ?? 'Unknown',
          icon: domain?.icon ?? 'book-open',
        },
      };
    });
  }
}
