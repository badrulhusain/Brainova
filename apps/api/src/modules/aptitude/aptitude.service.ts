import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  AptitudeQuestionModelName,
  AptitudeResultModelName,
  serialize,
  serializeMany,
  type AptitudeCategory,
  type AptitudeQuestion,
  type AptitudeResult,
  type MongoModel,
} from '../../database/mongo.schemas';
import type { SubmitAptitudeDto } from './dto/submit-aptitude.dto';

const APTITUDE_CATEGORIES: AptitudeCategory[] = [
  'HUMANITIES',
  'FINE_ARTS',
  'COMMUNICATIONS',
  'VISUAL_DESIGN',
  'TECHNOLOGY',
  'MANAGEMENT',
  'COMMERCE',
  'CHEMICAL_SCIENCES',
  'PHYSICAL_SCIENCES',
  'LOGICAL_ANALYTICAL',
];

type PublicAptitudeQuestion = Pick<AptitudeQuestion, 'id' | 'text' | 'options' | 'category'>;
type AptitudeScores = Record<AptitudeCategory, number>;
type AptitudeQuestionDocument = Omit<AptitudeQuestion, 'id'> & { _id: Types.ObjectId };

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

@Injectable()
export class AptitudeService {
  constructor(
    @InjectModel(AptitudeQuestionModelName)
    private readonly questionModel: MongoModel<AptitudeQuestion>,
    @InjectModel(AptitudeResultModelName)
    private readonly resultModel: MongoModel<AptitudeResult>,
  ) {}

  async getQuestions(): Promise<PublicAptitudeQuestion[]> {
    const questionGroups = await Promise.all(
      APTITUDE_CATEGORIES.map((category) =>
        this.questionModel.aggregate<AptitudeQuestionDocument>([
          { $match: { active: true, category } },
          { $sample: { size: 3 } },
        ]),
      ),
    );

    return shuffle(questionGroups.flat())
      .slice(0, 30)
      .map((question) => ({
        id: String(question._id),
        text: question.text,
        options: question.options,
        category: question.category,
      }));
  }

  private async computeScores(
    answers: Record<string, string>,
  ): Promise<{ scores: AptitudeScores; strongestCategory: AptitudeCategory }> {
    const questionIds = Object.keys(answers).filter((id) => Types.ObjectId.isValid(id));
    const questions = serializeMany<AptitudeQuestion>(
      await this.questionModel.find({ _id: { $in: questionIds } }),
    );

    const byId = new Map(questions.map((question) => [question.id, question]));
    const totals = APTITUDE_CATEGORIES.reduce<Record<AptitudeCategory, number>>(
      (acc, category) => { acc[category] = 0; return acc; },
      {} as Record<AptitudeCategory, number>,
    );
    const correct = APTITUDE_CATEGORIES.reduce<Record<AptitudeCategory, number>>(
      (acc, category) => { acc[category] = 0; return acc; },
      {} as Record<AptitudeCategory, number>,
    );

    for (const [questionId, answer] of Object.entries(answers)) {
      const question = byId.get(questionId);
      if (!question) continue;
      totals[question.category] += 1;
      if (answer === question.correctAnswer) {
        correct[question.category] += 1;
      }
    }

    const scores = APTITUDE_CATEGORIES.reduce<AptitudeScores>((acc, category) => {
      acc[category] =
        totals[category] > 0 ? Math.round((correct[category] / totals[category]) * 100) : 0;
      return acc;
    }, {} as AptitudeScores);

    const strongestCategory = APTITUDE_CATEGORIES.reduce<AptitudeCategory>(
      (best, category) => (scores[category] > scores[best] ? category : best),
      APTITUDE_CATEGORIES[0],
    );

    return { scores, strongestCategory };
  }

  async submit(studentId: string, dto: SubmitAptitudeDto): Promise<AptitudeResult> {
    const { scores, strongestCategory } = await this.computeScores(dto.answers);

    return serialize<AptitudeResult>(
      await this.resultModel.create({
        studentId,
        answers: dto.answers,
        scores,
        strongestCategory,
      }),
    );
  }

  async previewScore(
    answers: Record<string, string>,
  ): Promise<{ scores: AptitudeScores; strongestCategory: AptitudeCategory }> {
    return this.computeScores(answers);
  }

  async getAllQuestionsAdmin(): Promise<AptitudeQuestion[]> {
    return serializeMany<AptitudeQuestion>(
      await this.questionModel.find({ active: true }).sort({ category: 1, createdAt: 1 }),
    );
  }

  async getLatestResult(studentId: string): Promise<AptitudeResult | null> {
    return serialize<AptitudeResult | null>(
      await this.resultModel.findOne({ studentId }).sort({ createdAt: -1 }),
    );
  }

  async getResultById(id: string, studentId: string): Promise<AptitudeResult> {
    const result = Types.ObjectId.isValid(id)
      ? serialize<AptitudeResult | null>(await this.resultModel.findById(id))
      : null;

    if (!result || result.studentId !== studentId) {
      throw new NotFoundException('Aptitude result not found');
    }

    return result;
  }
}
