import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import {
  AnswerKeyModelName,
  serialize,
  serializeMany,
  TestAttemptModelName,
  TestConfigModelName,
  TestResultModelName,
  TestSessionModelName,
  type AnswerKey,
  type MongoModel,
  type Question,
  type TestAttempt,
  type TestConfig,
  type TestResult,
  type TestSession,
} from '../../database/mongo.schemas';
import { calculateMarks, type QuestionStatus } from './helpers/calculate-marks';

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

  constructor(
    @InjectModel(TestSessionModelName)
    private readonly sessionModel: MongoModel<TestSession>,
    @InjectModel(TestConfigModelName)
    private readonly configModel: MongoModel<TestConfig>,
    @InjectModel(AnswerKeyModelName)
    private readonly answerKeyModel: MongoModel<AnswerKey>,
    @InjectModel(TestResultModelName)
    private readonly resultModel: MongoModel<TestResult>,
    @InjectModel(TestAttemptModelName)
    private readonly attemptModel: MongoModel<TestAttempt>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async scoreSession(sessionId: string): Promise<{ resultId: string }> {
    const session = serialize<TestSession>(await this.sessionModel.findById(sessionId));
    if (!session) throw new NotFoundException('Session not found');

    if (session.status === 'SUBMITTED') {
      const result = await this.resultModel.findOne({ sessionId }).select('_id');
      if (result) return { resultId: String(result._id) };
    }

    if (session.status !== 'IN_PROGRESS' && session.status !== 'EXPIRED') {
      throw new ConflictException(`Session cannot be scored (current status: ${session.status})`);
    }

    const lock = await this.sessionModel.updateOne(
      { _id: sessionId, status: { $in: ['IN_PROGRESS', 'EXPIRED'] } },
      { status: 'SCORING' },
    );
    if (lock.modifiedCount === 0) {
      throw new ConflictException('Session is already being scored or has been submitted');
    }

    try {
      return await this.computeAndPersist(session, sessionId);
    } catch (error) {
      await this.sessionModel
        .updateOne({ _id: sessionId }, { status: 'EXPIRED' })
        .catch((rollbackError: unknown) =>
          this.logger.error('Failed to roll back session status', rollbackError),
        );
      throw error;
    }
  }

  private async computeAndPersist(
    session: TestSession,
    sessionId: string,
  ): Promise<{ resultId: string }> {
    const config = serialize<TestConfig>(await this.configModel.findById(session.configId));
    if (!config) throw new NotFoundException('Test configuration not found');

    const snapshot = session.questionSnapshot as Question[];
    const userAnswers = session.answers ?? {};
    const negativeMarks = config.marksPerQuestion * config.negativeMarksRatio;
    const questionIds = snapshot.map((question) => question.id);
    const answerKeys = serializeMany<AnswerKey>(
      await this.answerKeyModel.find({ questionId: { $in: questionIds } }),
    );
    const answerKeyMap = new Map(answerKeys.map((answerKey) => [answerKey.questionId, answerKey]));

    let runningMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    const topicAccum: Record<string, Omit<TopicBreakdownEntry, 'accuracy'>> = {};
    const difficultyAccum: Record<string, Omit<BreakdownBucket, 'accuracy'>> = {};
    const questionResults: QuestionResultEntry[] = [];

    for (const question of snapshot) {
      const answerKey = answerKeyMap.get(question.id);
      if (!answerKey) {
        this.logger.warn(`Missing answer key for question ${question.id}`);
        continue;
      }

      const userAnswer = userAnswers[question.id] ?? null;
      const { status, marks } = calculateMarks({
        userAnswer,
        correctAnswer: answerKey.correctAnswer,
        marksPerQuestion: config.marksPerQuestion,
        negativeMarks,
      });

      runningMarks += marks;
      if (status === 'CORRECT') correctCount++;
      else if (status === 'INCORRECT') incorrectCount++;
      else skippedCount++;

      const topic = (topicAccum[question.topicId] ??= {
        topicId: question.topicId,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: 0,
      });
      topic[status.toLowerCase() as 'correct' | 'incorrect' | 'skipped']++;
      topic.total++;

      const difficulty = question.difficulty.toUpperCase();
      const diff = (difficultyAccum[difficulty] ??= {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: 0,
      });
      diff[status.toLowerCase() as 'correct' | 'incorrect' | 'skipped']++;
      diff.total++;

      questionResults.push({
        questionId: question.id,
        text: question.text,
        options: question.options,
        userAnswer,
        correctAnswer: answerKey.correctAnswer,
        explanation: answerKey.explanation,
        status,
        marks,
        topicId: question.topicId,
        subtopicId: question.subtopicId,
        difficulty: question.difficulty,
      });
    }

    const scoredMarks = Math.max(0, runningMarks);
    const totalMarks = snapshot.length * config.marksPerQuestion;
    const attemptedCount = correctCount + incorrectCount;
    const percentageScore = totalMarks > 0 ? (scoredMarks / totalMarks) * 100 : 0;
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

    const topicBreakdown = Object.fromEntries(
      Object.entries(topicAccum).map(([id, data]) => {
        const attempted = data.correct + data.incorrect;
        return [id, { ...data, accuracy: attempted > 0 ? (data.correct / attempted) * 100 : 0 }];
      }),
    );
    const difficultyBreakdown = Object.fromEntries(
      Object.entries(difficultyAccum).map(([difficulty, data]) => {
        const attempted = data.correct + data.incorrect;
        return [
          difficulty,
          { ...data, accuracy: attempted > 0 ? (data.correct / attempted) * 100 : 0 },
        ];
      }),
    );

    const mongoSession = await this.connection.startSession();
    try {
      let resultId = '';
      await mongoSession.withTransaction(async () => {
        const [result] = await this.resultModel.create(
          [
            {
              sessionId,
              studentId: session.studentId,
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
          ],
          { session: mongoSession },
        );

        await this.attemptModel.create(
          [
            {
              studentId: session.studentId,
              resultId: String(result._id),
              domainId: session.domainId,
              scoredMarks,
              totalMarks,
              accuracy,
              correctCount,
              totalQuestions: snapshot.length,
              date: new Date(),
            },
          ],
          { session: mongoSession },
        );

        await this.sessionModel.updateOne(
          { _id: sessionId },
          { status: 'SUBMITTED', submittedAt: new Date() },
          { session: mongoSession },
        );

        resultId = String(result._id);
      });
      return { resultId };
    } finally {
      await mongoSession.endSession();
    }
  }
}
