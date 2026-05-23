/** ISO date string returned by the NestJS REST API. */
export type ISODate = string;

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'FILL';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type TestSessionStatus = 'IN_PROGRESS' | 'SCORING' | 'SUBMITTED' | 'ABANDONED' | 'EXPIRED';

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  order: number;
  createdAt?: ISODate;
  updatedAt?: ISODate;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  createdAt?: ISODate;
  updatedAt?: ISODate;
}

export interface Subtopic {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  createdAt?: ISODate;
  updatedAt?: ISODate;
}

export interface PublicQuestion {
  id: string;
  domainId: string;
  topicId: string;
  subtopicId: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  text: string;
  options: string[];
  marks: number;
  negativeMarks: number;
  timeRecommended: number;
  tags: string[];
  active: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
  createdBy: string;
  updatedBy: string;
}

/** Question as stored in session snapshot — no correctAnswer or explanation. */
export interface SnapshotQuestion {
  id: string;
  domainId: string;
  topicId: string;
  subtopicId: string;
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
  userId: string;
  configId: string;
  domainId: string;
  status: TestSessionStatus;
  startedAt: ISODate;
  expiresAt: ISODate;
  questionSnapshot: SnapshotQuestion[];
  answers: Record<string, string>;
  markedForReview: Record<string, boolean>;
  tabSwitchCount: number;
  lastSavedAt?: ISODate;
  submittedAt?: ISODate;
  config: {
    name: string;
    duration: number;
    marksPerQuestion: number;
    negativeMarksRatio: number;
    totalQuestions: number;
  };
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
  accuracy: number;
}

export interface QuestionResult {
  questionId: string;
  text: string;
  options: string[];
  type: QuestionType;
  difficulty: QuestionDifficulty;
  topicId: string;
  subtopicId: string;
  userAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  status: 'CORRECT' | 'INCORRECT' | 'SKIPPED';
  marks: number;
}

export interface TestResult {
  id: string;
  sessionId: string;
  userId: string;
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
  difficultyBreakdown: Record<string, DifficultyResultSummary>;
  questionResults: QuestionResult[];
  createdAt: ISODate;
}

export interface TestAttemptSummary {
  id: string;
  domainId: string;
  resultId: string;
  scoredMarks: number;
  totalMarks: number;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  date: ISODate;
}
