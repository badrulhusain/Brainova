import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  QuestionModelName,
  serialize,
  serializeMany,
  TestConfigModelName,
  TestSessionModelName,
  type MongoModel,
  type Question,
  type TestConfig,
  type TestSession,
} from '../../database/mongo.schemas';
import { shuffleArray } from './helpers/shuffle';

export type SnapshotQuestion = Question;

type SessionWithConfig = TestSession & {
  userId: string;
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
  constructor(
    @InjectModel(TestSessionModelName)
    private readonly sessionModel: MongoModel<TestSession>,
    @InjectModel(TestConfigModelName)
    private readonly configModel: MongoModel<TestConfig>,
    @InjectModel(QuestionModelName)
    private readonly questionModel: MongoModel<Question>,
  ) {}

  async createSession(studentId: string, configId: string): Promise<{ sessionId: string }> {
    const existing = await this.sessionModel.findOne({
      studentId,
      configId,
      status: 'IN_PROGRESS',
    });
    if (existing) return { sessionId: String(existing._id) };

    const config = serialize<TestConfig>(
      await this.configModel.findOne({ _id: configId, active: true }),
    );
    if (!config) throw new NotFoundException('Test configuration not found');

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

    const easy = serializeMany<Question>(easyPool);
    const medium = serializeMany<Question>(mediumPool);
    const hard = serializeMany<Question>(hardPool);

    this.assertPoolSize('EASY', easy.length, config.easyCount);
    this.assertPoolSize('MEDIUM', medium.length, config.mediumCount);
    this.assertPoolSize('HARD', hard.length, config.hardCount);

    const selected = [
      ...shuffleArray(easy).slice(0, config.easyCount),
      ...shuffleArray(medium).slice(0, config.mediumCount),
      ...shuffleArray(hard).slice(0, config.hardCount),
    ];

    const questions = config.shuffleQuestions ? shuffleArray(selected) : selected;
    const snapshot: SnapshotQuestion[] = questions.map((question) => ({
      ...question,
      options: config.shuffleOptions ? shuffleArray(question.options) : question.options,
    }));

    const now = new Date();
    const session = await this.sessionModel.create({
      studentId,
      configId,
      domainId: config.domainId,
      status: 'IN_PROGRESS',
      questionSnapshot: snapshot,
      answers: {},
      markedForReview: {},
      startedAt: now,
      expiresAt: new Date(now.getTime() + config.duration * 1000),
      lastSavedAt: now,
    });

    return { sessionId: String(session._id) };
  }

  async getSession(sessionId: string): Promise<SessionWithConfig> {
    const session = serialize<TestSession>(await this.sessionModel.findById(sessionId));
    if (!session) throw new NotFoundException('Session not found');
    const config = serialize<TestConfig>(await this.configModel.findById(session.configId));
    if (!config) throw new NotFoundException('Test configuration not found');

    return {
      ...session,
      userId: session.studentId,
      answers: (session.answers as Record<string, string> | null) ?? {},
      markedForReview: (session.markedForReview as Record<string, boolean> | null) ?? {},
      tabSwitchCount: session.tabSwitchCount ?? 0,
      config: {
        name: config.name,
        duration: config.duration,
        marksPerQuestion: config.marksPerQuestion,
        negativeMarksRatio: config.negativeMarksRatio,
        totalQuestions: config.totalQuestions,
      },
    };
  }

  async getActiveSession(studentId: string): Promise<TestSession | null> {
    const session = await this.sessionModel
      .findOne({ studentId, status: 'IN_PROGRESS' })
      .sort({ startedAt: -1 });
    return session ? serialize<TestSession>(session) : null;
  }

  async verifyOwnership(sessionId: string, studentId: string): Promise<TestSession> {
    const session = serialize<TestSession>(await this.sessionModel.findById(sessionId));
    if (!session) throw new NotFoundException('Session not found');
    if (session.studentId !== studentId) throw new NotFoundException('Session not found');
    return session;
  }

  async saveAnswer(sessionId: string, questionId: string, answer: string): Promise<void> {
    const session = await this.sessionModel.findById(sessionId).select('answers status');
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is no longer active');
    }

    const answers = { ...((session.answers as Record<string, string>) ?? {}), [questionId]: answer };
    await this.sessionModel.updateOne({ _id: sessionId }, { answers, lastSavedAt: new Date() });
  }

  async saveAnswers(
    sessionId: string,
    studentId: string,
    answers: Record<string, string>,
    markedForReview?: Record<string, boolean>,
  ): Promise<{ saved: true }> {
    const session = await this.verifyOwnership(sessionId, studentId);
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('This test has already been submitted');
    }

    await this.sessionModel.updateOne(
      { _id: sessionId },
      {
        answers,
        ...(markedForReview ? { markedForReview } : {}),
        lastSavedAt: new Date(),
      },
    );

    return { saved: true };
  }

  async toggleReview(sessionId: string, questionId: string): Promise<boolean> {
    const session = await this.sessionModel.findById(sessionId).select('markedForReview status');
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is no longer active');
    }

    const marked = { ...((session.markedForReview as Record<string, boolean>) ?? {}) };
    marked[questionId] = !marked[questionId];
    await this.sessionModel.updateOne({ _id: sessionId }, { marked });
    return marked[questionId] ?? false;
  }

  async recordTabSwitch(sessionId: string): Promise<number> {
    const updated = await this.sessionModel.findByIdAndUpdate(
      sessionId,
      { $inc: { tabSwitchCount: 1 } },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Session not found');
    return updated.tabSwitchCount;
  }

  private assertPoolSize(difficulty: string, available: number, required: number): void {
    if (available < required) {
      throw new BadRequestException(
        `Insufficient ${difficulty} questions: need ${required}, available ${available}. ` +
          `Add more questions or adjust the test configuration.`,
      );
    }
  }
}
