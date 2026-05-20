import type { Timestamp } from 'firebase/firestore';

export type QuestionType = 'mcq' | 'true_false' | 'fill';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type TestSessionStatus = 'in_progress' | 'submitted' | 'abandoned' | 'expired';

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  order: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Subtopic {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PublicQuestion {
  id: string;
  domain: string;
  topic: string;
  subtopic: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  text: string;
  options: string[];
  marks: number;
  negativeMarks: number;
  timeRecommended: number;
  tags: string[];
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export interface TestSession {
  id: string;
  ownerUid: string;
  domainId: string;
  status: TestSessionStatus;
  startedAt: Timestamp;
  duration: number;
  questionSnapshot: PublicQuestion[];
  answers: Record<string, string>;
  questionCount: number;
  lastSavedAt?: Timestamp;
  resultId?: string;
  submittedAt?: Timestamp;
}

export interface TopicResultSummary {
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
  avgTimePerQuestion: number;
}

export interface DifficultyResultSummary {
  total: number;
  correct: number;
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  timeTaken: number;
}

export interface TestResult {
  id: string;
  ownerUid: string;
  domainId: string;
  sessionId: string;
  totalMarks: number;
  scoredMarks: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  topicBreakdown: Record<string, TopicResultSummary>;
  difficultyBreakdown: Record<QuestionDifficulty, DifficultyResultSummary>;
  questionResults: QuestionResult[];
  createdAt: Timestamp;
}

export interface TestAttemptSummary {
  id: string;
  domainId: string;
  resultId: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  attemptedCount: number;
  totalQuestions: number;
  date: Timestamp;
}
