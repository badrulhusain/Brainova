import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DomainModelName,
  serializeMany,
  TestAttemptModelName,
  TestResultModelName,
  TopicModelName,
  type Domain,
  type MongoModel,
  type TestAttempt,
  type TestResult,
  type Topic,
} from '../../database/mongo.schemas';

interface TopicBreakdownJson {
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
}

interface DifficultyBreakdownJson {
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(TestResultModelName)
    private readonly resultModel: MongoModel<TestResult>,
    @InjectModel(TestAttemptModelName)
    private readonly attemptModel: MongoModel<TestAttempt>,
    @InjectModel(DomainModelName)
    private readonly domainModel: MongoModel<Domain>,
    @InjectModel(TopicModelName)
    private readonly topicModel: MongoModel<Topic>,
  ) {}

  async getSummary(studentId: string) {
    const results = serializeMany<TestResult>(await this.resultModel.find({ studentId }));
    const totalTests = results.length;
    const totalCorrect = results.reduce((sum, result) => sum + result.correctCount, 0);
    const totalAttempted = results.reduce((sum, result) => sum + result.attemptedCount, 0);
    const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
    const averageScore =
      totalTests > 0
        ? results.reduce((sum, result) => sum + result.percentageScore, 0) / totalTests
        : 0;
    const bestScore = Math.max(0, ...results.map((result) => result.percentageScore));

    return {
      totalTests,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore: Math.round(bestScore * 100) / 100,
      totalCorrect,
      totalAttempted,
      totalQuestions,
      overallAccuracy:
        totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 10000) / 100 : 0,
    };
  }

  async getAttempts(studentId: string, page: number, limit: number, domainId?: string) {
    const where = { studentId, ...(domainId && { domainId }) };
    const [total, attempts] = await Promise.all([
      this.attemptModel.countDocuments(where),
      this.attemptModel
        .find(where)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const items = serializeMany<TestAttempt>(attempts);
    const domains = serializeMany<Domain>(
      await this.domainModel.find({ _id: { $in: [...new Set(items.map((item) => item.domainId))] } }),
    );
    const results = serializeMany<TestResult>(
      await this.resultModel.find({ _id: { $in: items.map((item) => item.resultId) } }),
    );
    const domainMap = new Map(domains.map((domain) => [domain.id, domain]));
    const resultMap = new Map(results.map((result) => [result.id, result]));

    return {
      items: items.map((item) => ({
        ...item,
        domain: domainMap.get(item.domainId) ?? null,
        result: resultMap.get(item.resultId) ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getScoreTrend(studentId: string) {
    const attempts = serializeMany<TestAttempt>(
      await this.attemptModel.find({ studentId }).sort({ date: -1 }).limit(20),
    );
    const domains = serializeMany<Domain>(
      await this.domainModel.find({ _id: { $in: [...new Set(attempts.map((a) => a.domainId))] } }),
    );
    const results = serializeMany<TestResult>(
      await this.resultModel.find({ _id: { $in: attempts.map((a) => a.resultId) } }),
    );
    const domainMap = new Map(domains.map((domain) => [domain.id, domain]));
    const resultMap = new Map(results.map((result) => [result.id, result]));

    return attempts
      .map((attempt) => ({
        date: attempt.date,
        percentageScore: resultMap.get(attempt.resultId)?.percentageScore ?? 0,
        scoredMarks: attempt.scoredMarks,
        totalMarks: attempt.totalMarks,
        domainId: attempt.domainId,
        domainName: domainMap.get(attempt.domainId)?.name ?? 'Unknown',
      }))
      .reverse();
  }

  async getWeakTopics(studentId: string) {
    const results = serializeMany<TestResult>(
      await this.resultModel.find({ studentId }).select('topicBreakdown'),
    );
    const topicStats = new Map<string, { correct: number; attempted: number }>();

    for (const result of results) {
      const breakdown = result.topicBreakdown as Record<string, TopicBreakdownJson>;
      for (const [topicId, data] of Object.entries(breakdown)) {
        const current = topicStats.get(topicId) ?? { correct: 0, attempted: 0 };
        current.correct += data.correct;
        current.attempted += data.correct + data.incorrect;
        topicStats.set(topicId, current);
      }
    }

    const sorted = Array.from(topicStats.entries())
      .filter(([, stats]) => stats.attempted > 0)
      .map(([topicId, stats]) => ({
        topicId,
        correct: stats.correct,
        attempted: stats.attempted,
        accuracy: Math.round((stats.correct / stats.attempted) * 10000) / 100,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    const topics = serializeMany<Topic>(
      await this.topicModel.find({ _id: { $in: sorted.map((topic) => topic.topicId) } }),
    );
    const topicMap = new Map(topics.map((topic) => [topic.id, topic]));

    return sorted.map((weakTopic) => ({
      ...weakTopic,
      topicName: topicMap.get(weakTopic.topicId)?.name ?? 'Unknown',
      domainId: topicMap.get(weakTopic.topicId)?.domainId ?? '',
    }));
  }

  async getDifficultyChart(studentId: string) {
    const results = serializeMany<TestResult>(
      await this.resultModel.find({ studentId }).select('difficultyBreakdown'),
    );
    const accum: Record<string, { correct: number; attempted: number; total: number }> = {
      EASY: { correct: 0, attempted: 0, total: 0 },
      MEDIUM: { correct: 0, attempted: 0, total: 0 },
      HARD: { correct: 0, attempted: 0, total: 0 },
    };

    for (const result of results) {
      const breakdown = result.difficultyBreakdown as Record<string, DifficultyBreakdownJson>;
      for (const [difficulty, data] of Object.entries(breakdown)) {
        const key = difficulty.toUpperCase();
        if (key in accum) {
          accum[key].correct += data.correct;
          accum[key].attempted += data.correct + data.incorrect;
          accum[key].total += data.total;
        }
      }
    }

    return Object.fromEntries(
      Object.entries(accum).map(([difficulty, stats]) => [
        difficulty,
        {
          correct: stats.correct,
          attempted: stats.attempted,
          total: stats.total,
          accuracy:
            stats.attempted > 0
              ? Math.round((stats.correct / stats.attempted) * 10000) / 100
              : 0,
        },
      ]),
    );
  }
}
