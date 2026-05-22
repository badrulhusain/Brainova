import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import {
  AnswerKeyModelName,
  QuestionModelName,
  serialize,
  serializeMany,
  type AnswerKey,
  type MongoModel,
  type Question,
} from '../../database/mongo.schemas';
import type { CreateQuestionDto } from './dto/create-question.dto';
import type { UpdateQuestionDto } from './dto/update-question.dto';
import type { QuestionFilterDto } from './dto/question-filter.dto';

export type PublicQuestion = Question & { answerKey?: undefined };

export interface QuestionListResult {
  items: PublicQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function toPublicQuestion(question: Question): PublicQuestion {
  return question as PublicQuestion;
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(QuestionModelName)
    private readonly questionModel: MongoModel<Question>,
    @InjectModel(AnswerKeyModelName)
    private readonly answerKeyModel: MongoModel<AnswerKey>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async findAll(filter: QuestionFilterDto): Promise<QuestionListResult> {
    const { domainId, topicId, subtopicId, difficulty, type, active, search, page, limit } =
      filter;

    const where: Record<string, unknown> = {
      ...(domainId && { domainId }),
      ...(topicId && { topicId }),
      ...(subtopicId && { subtopicId }),
      ...(difficulty && { difficulty }),
      ...(type && { type }),
      ...(active !== undefined && { active }),
      ...(search && { text: { $regex: search, $options: 'i' } }),
    };

    const [total, rows] = await Promise.all([
      this.questionModel.countDocuments(where),
      this.questionModel
        .find(where)
        .sort({ difficulty: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    return {
      items: serializeMany<Question>(rows).map(toPublicQuestion),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<PublicQuestion> {
    const question = await this.questionModel.findById(id);
    if (!question) throw new NotFoundException('Question not found');
    return toPublicQuestion(serialize<Question>(question));
  }

  async create(dto: CreateQuestionDto, userId: string): Promise<PublicQuestion> {
    const { answerKey, ...questionData } = dto;
    const session = await this.connection.startSession();
    try {
      let created: Question | null = null;
      await session.withTransaction(async () => {
        const [question] = await this.questionModel.create(
          [{ ...questionData, createdBy: userId, updatedBy: userId }],
          { session },
        );
        await this.answerKeyModel.create(
          [
            {
              questionId: String(question._id),
              correctAnswer: answerKey.correctAnswer,
              explanation: answerKey.explanation,
              updatedBy: userId,
            },
          ],
          { session },
        );
        created = serialize<Question>(question);
      });
      if (!created) throw new NotFoundException('Question not created');
      return toPublicQuestion(created);
    } finally {
      await session.endSession();
    }
  }

  async update(id: string, dto: UpdateQuestionDto, userId: string): Promise<PublicQuestion> {
    const existing = await this.questionModel.findById(id);
    if (!existing) throw new NotFoundException('Question not found');

    const { answerKey, ...questionData } = dto;
    const session = await this.connection.startSession();
    try {
      let updated: Question | null = null;
      await session.withTransaction(async () => {
        const question = await this.questionModel.findByIdAndUpdate(
          id,
          { ...questionData, updatedBy: userId },
          { new: true, session },
        );
        if (!question) throw new NotFoundException('Question not found');
        if (answerKey) {
          await this.answerKeyModel.updateOne(
            { questionId: id },
            { ...answerKey, updatedBy: userId },
            { upsert: true, session },
          );
        }
        updated = serialize<Question>(question);
      });
      if (!updated) throw new NotFoundException('Question not found');
      return toPublicQuestion(updated);
    } finally {
      await session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const question = await this.questionModel.findByIdAndUpdate(id, { active: false });
    if (!question) throw new NotFoundException('Question not found');
  }

  async getAnswerKey(id: string): Promise<AnswerKey> {
    const question = await this.questionModel.exists({ _id: id });
    if (!question) throw new NotFoundException('Question not found');
    const answerKey = await this.answerKeyModel.findOne({ questionId: id });
    if (!answerKey) throw new NotFoundException('Answer key not found');
    return serialize<AnswerKey>(answerKey);
  }

  async findForSession(params: {
    domainId: string;
    topicFilter: string[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    count: number;
  }): Promise<Question[]> {
    const rows = await this.questionModel.find({
      domainId: params.domainId,
      difficulty: params.difficulty,
      active: true,
      ...(params.topicFilter.length > 0 && { topicId: { $in: params.topicFilter } }),
    });
    return serializeMany<Question>(rows);
  }
}
