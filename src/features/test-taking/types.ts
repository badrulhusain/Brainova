import type { Timestamp } from 'firebase/firestore';

export type QuestionType = 'mcq' | 'true_false' | 'fill';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type TestSessionStatus = 'in_progress' | 'scoring' | 'submitted' | 'abandoned' | 'expired';

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

/** Question as stored in test_sessions — no correctAnswer or explanation */
export interface SnapshotQuestion {
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
  tags: string[];
}

export interface TestSession {
  id: string;
  ownerUid: string;
  configId: string;
  domainId: string;
  status: TestSessionStatus;
  startedAt: Timestamp;
  expiresAt: Timestamp;
  duration: number;
  questionSnapshot: SnapshotQuestion[];
  answers: Record<string, string>;
  markedForReview: Record<string, boolean>;
  tabSwitchCount: number;
  questionCount: number;
  lastSavedAt?: Timestamp;
  resultId?: string;
  submittedAt?: Timestamp;
}

export interface TopicResultSummary {
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
}

export interface DifficultyResultSummary {
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  options: string[];
  type: QuestionType;
  difficulty: QuestionDifficulty;
  topicId: string;
  subtopicId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  isSkipped: boolean;
  explanation: string;
  marksEarned: number;
}

export interface TestResult {
  id: string;
  ownerUid: string;
  sessionId: string;
  configId: string;
  domainId: string;
  totalMarks: number;
  scoredMarks: number;
  percentageScore: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracy: number;
  topicBreakdown: Record<string, TopicResultSummary>;
  difficultyBreakdown: Record<QuestionDifficulty, DifficultyResultSummary>;
  questionResults: QuestionResult[];
  createdAt: Timestamp;
}

export interface TestAttemptSummary {
  id: string;
  domainId: string;
  configId: string;
  resultId: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  date: Timestamp;
}
