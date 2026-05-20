import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Question, TestSession } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { shuffleArray } from './helpers/shuffle';

// Shape of each question stored in the session snapshot.
// answerKey is intentionally omitted — Prisma does not include it by default,
// and we never select it here. This guarantees the snapshot is always safe.
export type SnapshotQuestion = Omit<Question, 'createdAt' | 'updatedAt'>;

type SessionWithConfig = TestSession & {
  config: {
    name: string;
    duration: number;
    marksPerQuestion: number;
    negativeMarksRatio: number;
    totalQuestions: number;
  };
};

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ────────────────────────────────────────────────────────────────

  async createSession(
    userId: string,
    configId: string,
  ): Promise<{ sessionId: string }> {
    // 1. Prevent duplicate active sessions for the same user + config
    const existing = await this.prisma.testSession.findFirst({
      where: { userId, configId, status: 'IN_PROGRESS' },
    });
    if (existing) {
      throw new ConflictException(
        'You already have an active session for this test. Resume it instead.',
      );
    }

    // 2. Load config (must be active)
    const config = await this.prisma.testConfig.findUnique({
      where: { id: configId, active: true },
    });
    if (!config) throw new NotFoundException('Test configuration not found');

    // 3. Build per-difficulty where clause
    const topicFilter = config.topicFilter as string[];
    const baseWhere: Prisma.QuestionWhereInput = {
      domainId: config.domainId,
      active: true,
      ...(topicFilter.length > 0 && { topicId: { in: topicFilter } }),
    };

    // 4. One query per difficulty bucket — answerKey is NOT included (Prisma default)
    const [easyPool, mediumPool, hardPool] = await Promise.all([
      this.prisma.question.findMany({ where: { ...baseWhere, difficulty: 'EASY' } }),
      this.prisma.question.findMany({ where: { ...baseWhere, difficulty: 'MEDIUM' } }),
      this.prisma.question.findMany({ where: { ...baseWhere, difficulty: 'HARD' } }),
    ]);

    // 5. Validate pool sizes before selection
    this.assertPoolSize('EASY', easyPool.length, config.easyCount);
    this.assertPoolSize('MEDIUM', mediumPool.length, config.mediumCount);
    this.assertPoolSize('HARD', hardPool.length, config.hardCount);

    // 6. Fisher-Yates shuffle each bucket, then slice to required count
    const easySelected = shuffleArray(easyPool).slice(0, config.easyCount);
    const mediumSelected = shuffleArray(mediumPool).slice(0, config.mediumCount);
    const hardSelected = shuffleArray(hardPool).slice(0, config.hardCount);

    // 7. Merge buckets, optionally shuffle the full set
    let questions: Question[] = [...easySelected, ...mediumSelected, ...hardSelected];
    if (config.shuffleQuestions) {
      questions = shuffleArray(questions);
    }

    // 8. Optionally shuffle option order within each question
    //    correctAnswer is stored as the option TEXT so scoring is unaffected by option reordering
    const snapshot: SnapshotQuestion[] = questions.map((q) => ({
      ...q,
      options: config.shuffleOptions ? shuffleArray(q.options) : q.options,
    }));

    // 9. Create session — expiresAt = now + duration seconds
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.duration * 1000);

    const session = await this.prisma.testSession.create({
      data: {
        userId,
        configId,
        domainId: config.domainId,
        status: 'IN_PROGRESS',
        questionSnapshot: snapshot as unknown as Prisma.InputJsonValue,
        answers: {},
        markedForReview: {},
        expiresAt,
      },
    });

    // 10. Return only sessionId — questions are never returned here
    return { sessionId: session.id };
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async getSession(sessionId: string): Promise<SessionWithConfig> {
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        config: {
          select: {
            name: true,
            duration: true,
            marksPerQuestion: true,
            negativeMarksRatio: true,
            totalQuestions: true,
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getActiveSession(userId: string): Promise<TestSession | null> {
    return this.prisma.testSession.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: { startedAt: 'desc' },
    });
  }

  // ── Internal helpers (used by gateway and scheduler) ──────────────────────

  async verifyOwnership(sessionId: string, userId: string): Promise<TestSession> {
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new NotFoundException('Session not found');
    return session;
  }

  async saveAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
  ): Promise<void> {
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      select: { answers: true, status: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is no longer active');
    }

    const answers = { ...(session.answers as Record<string, string>), [questionId]: answer };
    await this.prisma.testSession.update({
      where: { id: sessionId },
      data: { answers, lastSavedAt: new Date() },
    });
  }

  async toggleReview(sessionId: string, questionId: string): Promise<boolean> {
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      select: { markedForReview: true, status: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is no longer active');
    }

    const marked = { ...(session.markedForReview as Record<string, boolean>) };
    marked[questionId] = !marked[questionId];

    await this.prisma.testSession.update({
      where: { id: sessionId },
      data: { markedForReview: marked },
    });

    return marked[questionId] ?? false;
  }

  async recordTabSwitch(sessionId: string): Promise<number> {
    const [updated] = await this.prisma.$transaction([
      this.prisma.testSession.update({
        where: { id: sessionId },
        data: { tabSwitchCount: { increment: 1 } },
      }),
      this.prisma.sessionEvent.create({
        data: {
          sessionId,
          type: 'TAB_SWITCH',
          payload: {},
        },
      }),
    ]);
    return updated.tabSwitchCount;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private assertPoolSize(
    difficulty: string,
    available: number,
    required: number,
  ): void {
    if (available < required) {
      throw new BadRequestException(
        `Insufficient ${difficulty} questions: need ${required}, available ${available}. ` +
          `Add more questions or adjust the test configuration.`,
      );
    }
  }
}
