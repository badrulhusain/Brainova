import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /analytics/summary ────────────────────────────────────────────────

  async getSummary(userId: string) {
    const stats = await this.prisma.testResult.aggregate({
      where: { userId },
      _count: { id: true },
      _avg: { percentageScore: true, accuracy: true },
      _max: { percentageScore: true },
      _sum: { correctCount: true, attemptedCount: true, totalQuestions: true },
    });

    const totalTests = stats._count.id;
    const totalCorrect = stats._sum.correctCount ?? 0;
    const totalAttempted = stats._sum.attemptedCount ?? 0;

    return {
      totalTests,
      averageScore: Math.round((stats._avg.percentageScore ?? 0) * 100) / 100,
      bestScore: Math.round((stats._max.percentageScore ?? 0) * 100) / 100,
      totalCorrect,
      totalAttempted,
      totalQuestions: stats._sum.totalQuestions ?? 0,
      overallAccuracy:
        totalAttempted > 0
          ? Math.round((totalCorrect / totalAttempted) * 10000) / 100
          : 0,
    };
  }

  // ── GET /analytics/attempts ───────────────────────────────────────────────

  async getAttempts(
    userId: string,
    page: number,
    limit: number,
    domainId?: string,
  ) {
    const where = { userId, ...(domainId && { domainId }) };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.testAttempt.count({ where }),
      this.prisma.testAttempt.findMany({
        where,
        include: {
          domain: { select: { id: true, name: true, icon: true } },
          result: {
            select: { id: true, percentageScore: true, configId: true },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── GET /analytics/score-trend ────────────────────────────────────────────

  async getScoreTrend(userId: string) {
    const attempts = await this.prisma.testAttempt.findMany({
      where: { userId },
      select: {
        date: true,
        domainId: true,
        scoredMarks: true,
        totalMarks: true,
        domain: { select: { name: true } },
        result: { select: { percentageScore: true } },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    // Return in chronological order (oldest first) for chart rendering
    return attempts
      .map((a) => ({
        date: a.date,
        percentageScore: a.result?.percentageScore ?? 0,
        scoredMarks: a.scoredMarks,
        totalMarks: a.totalMarks,
        domainId: a.domainId,
        domainName: a.domain.name,
      }))
      .reverse();
  }

  // ── GET /analytics/weak-topics ────────────────────────────────────────────

  async getWeakTopics(userId: string) {
    const results = await this.prisma.testResult.findMany({
      where: { userId },
      select: { topicBreakdown: true },
    });

    // Aggregate across all test results in memory
    const topicStats = new Map<string, { correct: number; attempted: number }>();

    for (const result of results) {
      const breakdown = result.topicBreakdown as Record<string, TopicBreakdownJson>;
      for (const [topicId, data] of Object.entries(breakdown)) {
        const cur = topicStats.get(topicId) ?? { correct: 0, attempted: 0 };
        cur.correct += data.correct;
        cur.attempted += data.correct + data.incorrect;
        topicStats.set(topicId, cur);
      }
    }

    // Lowest accuracy first, limit to 3, exclude topics with no attempts
    const sorted = Array.from(topicStats.entries())
      .filter(([, s]) => s.attempted > 0)
      .map(([topicId, s]) => ({
        topicId,
        correct: s.correct,
        attempted: s.attempted,
        accuracy: Math.round((s.correct / s.attempted) * 10000) / 100,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    if (sorted.length === 0) return [];

    // Enrich with topic metadata in one query
    const topicIds = sorted.map((t) => t.topicId);
    const topics = await this.prisma.topic.findMany({
      where: { id: { in: topicIds } },
      select: { id: true, name: true, domainId: true },
    });
    const topicMap = new Map(topics.map((t) => [t.id, t]));

    return sorted.map((wt) => ({
      ...wt,
      topicName: topicMap.get(wt.topicId)?.name ?? 'Unknown',
      domainId: topicMap.get(wt.topicId)?.domainId ?? '',
    }));
  }

  // ── GET /analytics/difficulty-chart ──────────────────────────────────────

  async getDifficultyChart(userId: string) {
    const results = await this.prisma.testResult.findMany({
      where: { userId },
      select: { difficultyBreakdown: true },
    });

    const accum: Record<string, { correct: number; attempted: number; total: number }> = {
      EASY: { correct: 0, attempted: 0, total: 0 },
      MEDIUM: { correct: 0, attempted: 0, total: 0 },
      HARD: { correct: 0, attempted: 0, total: 0 },
    };

    for (const result of results) {
      const breakdown = result.difficultyBreakdown as Record<
        string,
        DifficultyBreakdownJson
      >;
      for (const [diff, data] of Object.entries(breakdown)) {
        const key = diff.toUpperCase();
        if (key in accum) {
          accum[key].correct += data.correct;
          accum[key].attempted += data.correct + data.incorrect;
          accum[key].total += data.total;
        }
      }
    }

    return Object.fromEntries(
      Object.entries(accum).map(([diff, s]) => [
        diff,
        {
          correct: s.correct,
          attempted: s.attempted,
          total: s.total,
          accuracy:
            s.attempted > 0
              ? Math.round((s.correct / s.attempted) * 10000) / 100
              : 0,
        },
      ]),
    );
  }
}
