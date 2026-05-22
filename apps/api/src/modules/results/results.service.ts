import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  serialize,
  TestConfigModelName,
  TestResultModelName,
  TestSessionModelName,
  type MongoModel,
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

  private async loadResult(resultId: string, studentId: string) {
    const result = serialize<TestResult>(await this.resultModel.findById(resultId));
    if (!result || result.studentId !== studentId) {
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
