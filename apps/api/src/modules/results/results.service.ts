import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DomainModelName,
  serialize,
  serializeMany,
  StudentModelName,
  TestConfigModelName,
  TestResultModelName,
  TestSessionModelName,
  type Domain,
  type MongoModel,
  type Student,
  type TestConfig,
  type TestResult,
  type TestSession,
} from '../../database/mongo.schemas';
import type { ResultSummaryDto } from './dto/result-summary.dto';
import type { ResultReviewDto } from './dto/result-review.dto';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(TestResultModelName)
    private readonly resultModel: MongoModel<TestResult>,
    @InjectModel(TestSessionModelName)
    private readonly sessionModel: MongoModel<TestSession>,
    @InjectModel(TestConfigModelName)
    private readonly configModel: MongoModel<TestConfig>,
    @InjectModel(StudentModelName)
    private readonly studentModel: MongoModel<Student>,
    @InjectModel(DomainModelName)
    private readonly domainModel: MongoModel<Domain>,
  ) {}

  async findById(resultId: string, studentId: string): Promise<ResultReviewDto> {
    const result = await this.loadResult(resultId, studentId);
    return result as unknown as ResultReviewDto;
  }

  async findSummary(resultId: string, studentId: string): Promise<ResultSummaryDto> {
    const result = await this.loadResult(resultId, studentId);
    const { questionResults: _questionResults, ...summary } = result;
    return summary as unknown as ResultSummaryDto;
  }

  async findByIdForAdmin(resultId: string): Promise<ResultReviewDto> {
    const result = await this.loadResult(resultId);
    return result as unknown as ResultReviewDto;
  }

  async findAllForAdmin(page: number, limit: number) {
    const [total, results] = await Promise.all([
      this.resultModel.countDocuments(),
      this.resultModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const items = serializeMany<TestResult>(results);
    const studentIds = [...new Set(items.map((result) => result.studentId))];
    const domainIds = [...new Set(items.map((result) => result.domainId))];
    const sessionIds = [...new Set(items.map((result) => result.sessionId))];

    const [students, domains, sessions] = await Promise.all([
      this.studentModel.find({ _id: { $in: studentIds } }),
      this.domainModel.find({ _id: { $in: domainIds } }),
      this.sessionModel.find({ _id: { $in: sessionIds } }),
    ]);

    const serializedSessions = serializeMany<TestSession>(sessions);
    const configIds = [...new Set(serializedSessions.map((session) => session.configId))];
    const configs = serializeMany<TestConfig>(
      await this.configModel.find({ _id: { $in: configIds } }),
    );

    const studentMap = new Map(
      serializeMany<Student>(students).map((student) => [student.id, student]),
    );
    const domainMap = new Map(
      serializeMany<Domain>(domains).map((domain) => [domain.id, domain]),
    );
    const sessionMap = new Map(serializedSessions.map((session) => [session.id, session]));
    const configMap = new Map(configs.map((config) => [config.id, config]));

    return {
      items: items.map((result) => {
        const session = sessionMap.get(result.sessionId);
        const config = session ? configMap.get(session.configId) : null;

        return {
          id: result.id,
          studentId: result.studentId,
          student: studentMap.get(result.studentId) ?? null,
          domainId: result.domainId,
          domain: domainMap.get(result.domainId) ?? null,
          configId: result.configId,
          config: config ? { id: config.id, name: config.name } : null,
          scoredMarks: result.scoredMarks,
          totalMarks: result.totalMarks,
          percentageScore: result.percentageScore,
          accuracy: result.accuracy,
          correctCount: result.correctCount,
          incorrectCount: result.incorrectCount,
          skippedCount: result.skippedCount,
          totalQuestions: result.totalQuestions,
          createdAt: result.createdAt,
          submittedAt: session?.submittedAt ?? null,
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async loadResult(resultId: string, studentId?: string) {
    const result = serialize<TestResult>(await this.resultModel.findById(resultId));
    if (!result || (studentId && result.studentId !== studentId)) {
      throw new NotFoundException('Result not found');
    }

    const session = serialize<TestSession>(await this.sessionModel.findById(result.sessionId));
    const config = session
      ? serialize<TestConfig>(await this.configModel.findById(session.configId))
      : null;

    return {
      ...result,
      userId: result.studentId,
      session: session
        ? {
            startedAt: session.startedAt,
            submittedAt: session.submittedAt ?? null,
            tabSwitchCount: session.tabSwitchCount,
            config: {
              name: config?.name ?? 'Test',
              duration: config?.duration ?? 0,
            },
          }
        : null,
    };
  }
}
