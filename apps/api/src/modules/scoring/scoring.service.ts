import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { calculateMarks, type QuestionStatus } from './helpers/calculate-marks';

// ── Internal types ────────────────────────────────────────────────────────────

interface SnapshotQuestion {
  id: string;
  domainId: string;
  topicId: string;
  subtopicId: string;
  type: string;
  difficulty: string;
  text: string;
  options: string[];
  marks: number;
  negativeMarks: number;
  timeRecommended: number;
  tags: string[];
  active: boolean;
  createdBy: string;
  updatedBy: string;
}

interface BreakdownBucket {
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
  accuracy: number;
}

interface TopicBreakdownEntry extends BreakdownBucket {
  topicId: string;
}

interface QuestionResultEntry {
  questionId: string;
  text: string;
  options: string[];
  userAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  status: QuestionStatus;
  marks: number;
  topicId: string;
  subtopicId: string;
  difficulty: string;
}

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Score a test session end-to-end. Called by:
   *   - ScoringController (manual submit)
   *   - SessionsScheduler (auto-expiry)
   *
   * Double-submit safety: uses updateMany with status filter so only one
   * concurrent caller can win the SCORING lock.
   */
  async scoreSession(sessionId: string): Promise<{ resultId: string }> {
    // 1. Load session + config marks info
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        config: {
          select: { marksPerQuestion: true, negativeMarksRatio: true },
        },
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    // 2. Guard: only score sessions that are in a scoreable state
    if (session.status !== 'IN_PROGRESS' && session.status !== 'EXPIRED') {
      throw new ConflictException(
        `Session cannot be scored (current status: ${session.status})`,
      );
    }

    // 3. Atomic lock — prevents double-submit race conditions.
    //    updateMany returns count=0 if another request already changed the status.
    const { count } = await this.prisma.testSession.updateMany({
      where: { id: sessionId, status: { in: ['IN_PROGRESS', 'EXPIRED'] } },
      data: { status: 'SCORING' },
    });

    if (count === 0) {
      throw new ConflictException('Session is already being scored or has been submitted');
    }

    try {
      return await this.computeAndPersist(session, sessionId);
    } catch (err) {
      // Roll back to EXPIRED on failure so the scheduler can retry
      await this.prisma.testSession
        .update({ where: { id: sessionId }, data: { status: 'EXPIRED' } })
        .catch((e: unknown) => this.logger.error('Failed to roll back session status', e));
      throw err;
    }
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async computeAndPersist(
    session: Awaited<ReturnType<typeof this.loadSession>>,
    sessionId: string,
  ): Promise<{ resultId: string }> {
    const snapshot = session.questionSnapshot as unknown as SnapshotQuestion[];
    const userAnswers = session.answers as Record<string, string>;
    const { marksPerQuestion, negativeMarksRatio } = session.config;
    const negativeMarks = marksPerQuestion * negativeMarksRatio;

    // 4. Batch-load answer keys for all questions in snapshot
    const questionIds = snapshot.map((q) => q.id);
    const answerKeyRows = await this.prisma.answerKey.findMany({
      where: { questionId: { in: questionIds } },
    });
    const answerKeyMap = new Map(answerKeyRows.map((ak) => [ak.questionId, ak]));

    // 5. Score every question
    let runningMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const topicAccum: Record<string, Omit<TopicBreakdownEntry, 'accuracy'>> = {};
    const difficultyAccum: Record<string, Omit<BreakdownBucket, 'accuracy'>> = {};
    const questionResults: QuestionResultEntry[] = [];

    for (const q of snapshot) {
      const ak = answerKeyMap.get(q.id);
      if (!ak) {
        this.logger.warn(`Missing answer key for question ${q.id} — skipping`);
        continue;
      }

      const userAnswer = userAnswers[q.id] ?? null;
      const { status, marks } = calculateMarks({
        userAnswer,
        correctAnswer: ak.correctAnswer,
        marksPerQuestion,
        negativeMarks,
      });

      runningMarks += marks;
      if (status === 'CORRECT') correctCount++;
      else if (status === 'INCORRECT') incorrectCount++;
      else skippedCount++;

      // Accumulate topic breakdown
      const tb = (topicAccum[q.topicId] ??= {
        topicId: q.topicId,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: 0,
      });
      tb[status.toLowerCase() as 'correct' | 'incorrect' | 'skipped']++;
      tb.total++;

      // Accumulate difficulty breakdown
      const diff = q.difficulty.toUpperCase();
      const db = (difficultyAccum[diff] ??= { correct: 0, incorrect: 0, skipped: 0, total: 0 });
      db[status.toLowerCase() as 'correct' | 'incorrect' | 'skipped']++;
      db.total++;

      questionResults.push({
        questionId: q.id,
        text: q.text,
        options: q.options,
        userAnswer,
        correctAnswer: ak.correctAnswer,
        explanation: ak.explanation,
        status,
        marks,
        topicId: q.topicId,
        subtopicId: q.subtopicId,
        difficulty: q.difficulty,
      });
    }

    // 6. Floor total scored marks at 0
    const scoredMarks = Math.max(0, runningMarks);
    const totalMarks = snapshot.length * marksPerQuestion;
    const attemptedCount = correctCount + incorrectCount;
    const percentageScore = totalMarks > 0 ? (scoredMarks / totalMarks) * 100 : 0;
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

    // 7. Finalise breakdowns with computed accuracy
    const topicBreakdown: Record<string, TopicBreakdownEntry> = {};
    for (const [id, data] of Object.entries(topicAccum)) {
      const attempted = data.correct + data.incorrect;
      topicBreakdown[id] = {
        ...data,
        accuracy: attempted > 0 ? (data.correct / attempted) * 100 : 0,
      };
    }

    const difficultyBreakdown: Record<string, BreakdownBucket> = {};
    for (const [diff, data] of Object.entries(difficultyAccum)) {
      const attempted = data.correct + data.incorrect;
      difficultyBreakdown[diff] = {
        ...data,
        accuracy: attempted > 0 ? (data.correct / attempted) * 100 : 0,
      };
    }

    // 8. Write TestResult + TestAttempt + session update in one transaction
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const testResult = await tx.testResult.create({
        data: {
          sessionId,
          userId: session.userId,
          domainId: session.domainId,
          configId: session.configId,
          scoredMarks,
          totalMarks,
          percentageScore,
          accuracy,
          totalQuestions: snapshot.length,
          attemptedCount,
          correctCount,
          incorrectCount,
          skippedCount,
          topicBreakdown,
          difficultyBreakdown,
          questionResults,
        },
      });

      await tx.testAttempt.create({
        data: {
          userId: session.userId,
          resultId: testResult.id,
          domainId: session.domainId,
          scoredMarks,
          totalMarks,
          accuracy,
          correctCount,
          totalQuestions: snapshot.length,
        },
      });

      // 9. Mark session SUBMITTED
      await tx.testSession.update({
        where: { id: sessionId },
        data: { status: 'SUBMITTED', submittedAt: now },
      });

      return testResult;
    });

    return { resultId: result.id };
  }

  // Private helper typed so TypeScript can infer the return type in computeAndPersist
  private loadSession(sessionId: string) {
    return this.prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        config: { select: { marksPerQuestion: true, negativeMarksRatio: true } },
      },
    });
  }
}
