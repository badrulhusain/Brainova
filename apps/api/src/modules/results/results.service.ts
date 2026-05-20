import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { ResultSummaryDto } from './dto/result-summary.dto';
import type { ResultReviewDto } from './dto/result-review.dto';

const SESSION_FIELDS = {
  select: {
    startedAt: true,
    submittedAt: true,
    tabSwitchCount: true,
    config: { select: { name: true, duration: true } },
  },
} as const;

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Full result including questionResults (correctAnswer + explanation per question).
   * Only returned to the result owner; throws 404 to avoid revealing existence.
   */
  async findById(resultId: string, userId: string): Promise<ResultReviewDto> {
    const result = await this.prisma.testResult.findUnique({
      where: { id: resultId },
      include: { session: SESSION_FIELDS },
    });

    this.assertOwnership(result, userId);
    return result as unknown as ResultReviewDto;
  }

  /**
   * Score-card only — questionResults is excluded from the Prisma select
   * so answer key data never travels to the client via this endpoint.
   */
  async findSummary(resultId: string, userId: string): Promise<ResultSummaryDto> {
    const result = await this.prisma.testResult.findUnique({
      where: { id: resultId },
      select: {
        id: true,
        sessionId: true,
        userId: true,
        domainId: true,
        configId: true,
        scoredMarks: true,
        totalMarks: true,
        percentageScore: true,
        accuracy: true,
        totalQuestions: true,
        attemptedCount: true,
        correctCount: true,
        incorrectCount: true,
        skippedCount: true,
        topicBreakdown: true,
        difficultyBreakdown: true,
        createdAt: true,
        // questionResults deliberately omitted
        session: SESSION_FIELDS,
      },
    });

    this.assertOwnership(result, userId);
    return result as unknown as ResultSummaryDto;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private assertOwnership(
    result: { userId: string } | null,
    userId: string,
  ): asserts result is NonNullable<typeof result> {
    // Return 404 rather than 403 to avoid leaking whether the result exists
    if (!result || result.userId !== userId) {
      throw new NotFoundException('Result not found');
    }
  }
}
