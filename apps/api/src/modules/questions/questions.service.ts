import { Injectable, NotFoundException } from '@nestjs/common';
import type { AnswerKey, Prisma, Question } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { CreateQuestionDto } from './dto/create-question.dto';
import type { UpdateQuestionDto } from './dto/update-question.dto';
import type { QuestionFilterDto } from './dto/question-filter.dto';

// AnswerKey is never included in public-facing responses
export type PublicQuestion = Omit<Question, never> & { answerKey?: undefined };

export interface QuestionListResult {
  items: PublicQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function toPublicQuestion(q: Question & { answerKey?: AnswerKey | null }): PublicQuestion {
  // Destructure to strip answerKey regardless of whether Prisma included it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { answerKey: _ak, ...safe } = q as Question & { answerKey?: unknown };
  return safe as PublicQuestion;
}

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: QuestionFilterDto): Promise<QuestionListResult> {
    const { domainId, topicId, subtopicId, difficulty, type, active, search, page, limit } =
      filter;

    const where: Prisma.QuestionWhereInput = {
      ...(domainId && { domainId }),
      ...(topicId && { topicId }),
      ...(subtopicId && { subtopicId }),
      ...(difficulty && { difficulty }),
      ...(type && { type }),
      ...(active !== undefined && { active }),
      ...(search && { text: { contains: search, mode: 'insensitive' as const } }),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        // Never include answerKey in list responses
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    return {
      items: rows.map(toPublicQuestion),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<PublicQuestion> {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    return toPublicQuestion(question);
  }

  async create(dto: CreateQuestionDto, userId: string): Promise<PublicQuestion> {
    const { answerKey, ...questionData } = dto;

    const created = await this.prisma.$transaction(async (tx) => {
      return tx.question.create({
        data: {
          ...questionData,
          createdBy: userId,
          updatedBy: userId,
          answerKey: {
            create: {
              correctAnswer: answerKey.correctAnswer,
              explanation: answerKey.explanation,
              updatedBy: userId,
            },
          },
        },
        include: { answerKey: true },
      });
    });

    return toPublicQuestion(created);
  }

  async update(id: string, dto: UpdateQuestionDto, userId: string): Promise<PublicQuestion> {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found');

    const { answerKey, ...questionData } = dto;

    const updated = await this.prisma.$transaction(async (tx) => {
      return tx.question.update({
        where: { id },
        data: {
          ...questionData,
          updatedBy: userId,
          ...(answerKey && {
            answerKey: {
              upsert: {
                create: { ...answerKey, updatedBy: userId },
                update: { ...answerKey, updatedBy: userId },
              },
            },
          }),
        },
        include: { answerKey: true },
      });
    });

    return toPublicQuestion(updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found');
    await this.prisma.question.delete({ where: { id } });
  }

  // ── Admin only ─────────────────────────────────────────────────────────────

  async getAnswerKey(id: string): Promise<AnswerKey> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { answerKey: true },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (!question.answerKey) throw new NotFoundException('Answer key not found');
    return question.answerKey;
  }

  // ── Internal use by sessions.service ──────────────────────────────────────

  async findForSession(params: {
    domainId: string;
    topicFilter: string[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    count: number;
  }): Promise<Question[]> {
    const where: Prisma.QuestionWhereInput = {
      domainId: params.domainId,
      difficulty: params.difficulty,
      active: true,
      ...(params.topicFilter.length > 0 && { topicId: { in: params.topicFilter } }),
    };

    return this.prisma.question.findMany({ where });
  }
}
