import { Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'FILL';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type SessionStatus = 'IN_PROGRESS' | 'SCORING' | 'SUBMITTED' | 'EXPIRED';

export interface Student {
  id: string;
  name: string;
  admissionNo: string;
  department?: string | null;
  batch?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  domainId: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  domainId: string;
  topicId: string;
  subtopicId: string;
  type: QuestionType;
  difficulty: Difficulty;
  text: string;
  options: string[];
  marks: number;
  negativeMarks: number;
  timeRecommended: number;
  tags: string[];
  active: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnswerKey {
  id: string;
  questionId: string;
  correctAnswer: string;
  explanation: string;
  updatedBy: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface TestConfig {
  id: string;
  name: string;
  description: string;
  domainId: string;
  totalQuestions: number;
  duration: number;
  marksPerQuestion: number;
  negativeMarksRatio: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  topicFilter: string[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSession {
  id: string;
  studentId: string;
  configId: string;
  domainId: string;
  status: SessionStatus;
  questionSnapshot: Question[];
  answers: Record<string, string>;
  markedForReview: Record<string, boolean>;
  tabSwitchCount: number;
  startedAt: Date;
  expiresAt: Date;
  submittedAt?: Date | null;
  lastSavedAt: Date;
  config?: Pick<TestConfig, 'name' | 'duration' | 'marksPerQuestion' | 'negativeMarksRatio' | 'totalQuestions'>;
}

export interface TestResult {
  id: string;
  sessionId: string;
  studentId: string;
  domainId: string;
  configId: string;
  scoredMarks: number;
  totalMarks: number;
  percentageScore: number;
  accuracy: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  topicBreakdown: unknown;
  difficultyBreakdown: unknown;
  questionResults: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestAttempt {
  id: string;
  studentId: string;
  resultId: string;
  domainId: string;
  scoredMarks: number;
  totalMarks: number;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MongoDoc<T> = HydratedDocument<Omit<T, 'id'> & { _id: Types.ObjectId }>;
export type MongoModel<T> = Model<MongoDoc<T>>;

const idTransform = (_doc: unknown, ret: Record<string, unknown>) => {
  ret.id = String(ret._id);
  delete ret._id;
  delete ret.__v;
  return ret;
};

function withJson(schema: Schema): Schema {
  schema.set('toJSON', { virtuals: true, versionKey: false, transform: idTransform });
  schema.set('toObject', { virtuals: true, versionKey: false, transform: idTransform });
  return schema;
}

export function serialize<T>(doc: unknown): T {
  if (!doc) return doc as T;
  if (typeof (doc as { toJSON?: unknown }).toJSON === 'function') {
    return (doc as { toJSON: () => T }).toJSON();
  }
  const plain = { ...(doc as Record<string, unknown>) };
  if (plain._id) {
    plain.id = String(plain._id);
    delete plain._id;
  }
  delete plain.__v;
  return plain as T;
}

export function serializeMany<T>(docs: unknown[]): T[] {
  return docs.map((doc) => serialize<T>(doc));
}

export const StudentModelName = 'Student';
export const AdminModelName = 'Admin';
export const DomainModelName = 'Domain';
export const TopicModelName = 'Topic';
export const SubtopicModelName = 'Subtopic';
export const QuestionModelName = 'Question';
export const AnswerKeyModelName = 'AnswerKey';
export const TestConfigModelName = 'TestConfig';
export const TestSessionModelName = 'TestSession';
export const TestResultModelName = 'TestResult';
export const TestAttemptModelName = 'TestAttempt';

const optionalString = { type: String, default: null };
const requiredString = { type: String, required: true, trim: true };

export const StudentSchema = withJson(
  new Schema(
    {
      name: requiredString,
      admissionNo: { ...requiredString, uppercase: true, unique: true, index: true },
      department: optionalString,
      batch: optionalString,
      active: { type: Boolean, default: true, index: true },
    },
    { timestamps: true },
  ),
);

export const AdminSchema = withJson(
  new Schema(
    {
      username: { ...requiredString, unique: true, index: true },
      password: requiredString,
    },
    { timestamps: true },
  ),
);

export const DomainSchema = withJson(
  new Schema(
    {
      name: requiredString,
      description: requiredString,
      icon: requiredString,
      order: { type: Number, default: 0, index: true },
      active: { type: Boolean, default: true, index: true },
    },
    { timestamps: true },
  ),
);

export const TopicSchema = withJson(
  new Schema(
    {
      domainId: { type: String, required: true, index: true },
      name: requiredString,
      description: requiredString,
      order: { type: Number, default: 0, index: true },
      active: { type: Boolean, default: true, index: true },
    },
    { timestamps: true },
  ),
);

export const SubtopicSchema = withJson(
  new Schema(
    {
      topicId: { type: String, required: true, index: true },
      name: requiredString,
      description: requiredString,
      order: { type: Number, default: 0, index: true },
      active: { type: Boolean, default: true, index: true },
    },
    { timestamps: true },
  ),
);

export const QuestionSchema = withJson(
  new Schema(
    {
      domainId: { type: String, required: true, index: true },
      topicId: { type: String, required: true, index: true },
      subtopicId: { type: String, required: true, index: true },
      type: { type: String, enum: ['MCQ', 'TRUE_FALSE', 'FILL'], required: true, index: true },
      difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true, index: true },
      text: { type: String, required: true },
      options: { type: [String], default: [] },
      marks: { type: Number, default: 1 },
      negativeMarks: { type: Number, default: 0.25 },
      timeRecommended: { type: Number, default: 60 },
      tags: { type: [String], default: [] },
      active: { type: Boolean, default: true, index: true },
      createdBy: requiredString,
      updatedBy: requiredString,
    },
    { timestamps: true },
  ),
);

QuestionSchema.index({ domainId: 1, difficulty: 1, active: 1 });

export const AnswerKeySchema = withJson(
  new Schema(
    {
      questionId: { type: String, required: true, unique: true, index: true },
      correctAnswer: requiredString,
      explanation: requiredString,
      updatedBy: requiredString,
    },
    { timestamps: true },
  ),
);

export const TestConfigSchema = withJson(
  new Schema(
    {
      name: requiredString,
      description: requiredString,
      domainId: { type: String, required: true, index: true },
      totalQuestions: { type: Number, required: true },
      duration: { type: Number, required: true },
      marksPerQuestion: { type: Number, default: 1 },
      negativeMarksRatio: { type: Number, default: 0.25 },
      easyCount: { type: Number, required: true },
      mediumCount: { type: Number, required: true },
      hardCount: { type: Number, required: true },
      topicFilter: { type: [String], default: [] },
      shuffleQuestions: { type: Boolean, default: true },
      shuffleOptions: { type: Boolean, default: false },
      active: { type: Boolean, default: true, index: true },
      createdBy: requiredString,
    },
    { timestamps: true },
  ),
);

export const TestSessionSchema = withJson(
  new Schema(
    {
      studentId: { type: String, required: true, index: true },
      configId: { type: String, required: true, index: true },
      domainId: { type: String, required: true, index: true },
      status: { type: String, enum: ['IN_PROGRESS', 'SCORING', 'SUBMITTED', 'EXPIRED'], default: 'IN_PROGRESS', index: true },
      questionSnapshot: { type: Schema.Types.Mixed, required: true },
      answers: { type: Schema.Types.Mixed, default: {} },
      markedForReview: { type: Schema.Types.Mixed, default: {} },
      tabSwitchCount: { type: Number, default: 0 },
      startedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true },
      submittedAt: { type: Date, default: null },
      lastSavedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
  ),
);

TestSessionSchema.index({ studentId: 1, configId: 1, status: 1 });

export const TestResultSchema = withJson(
  new Schema(
    {
      sessionId: { type: String, required: true, unique: true, index: true },
      studentId: { type: String, required: true, index: true },
      domainId: { type: String, required: true, index: true },
      configId: { type: String, required: true, index: true },
      scoredMarks: { type: Number, required: true },
      totalMarks: { type: Number, required: true },
      percentageScore: { type: Number, required: true },
      accuracy: { type: Number, required: true },
      totalQuestions: { type: Number, required: true },
      attemptedCount: { type: Number, required: true },
      correctCount: { type: Number, required: true },
      incorrectCount: { type: Number, required: true },
      skippedCount: { type: Number, required: true },
      topicBreakdown: { type: Schema.Types.Mixed, default: {} },
      difficultyBreakdown: { type: Schema.Types.Mixed, default: {} },
      questionResults: { type: Schema.Types.Mixed, default: [] },
    },
    { timestamps: true },
  ),
);

export const TestAttemptSchema = withJson(
  new Schema(
    {
      studentId: { type: String, required: true, index: true },
      resultId: { type: String, required: true, unique: true, index: true },
      domainId: { type: String, required: true, index: true },
      scoredMarks: { type: Number, required: true },
      totalMarks: { type: Number, required: true },
      accuracy: { type: Number, required: true },
      correctCount: { type: Number, required: true },
      totalQuestions: { type: Number, required: true },
      date: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true },
  ),
);
