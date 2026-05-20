import type { Timestamp } from 'firebase/firestore';

export interface TestConfig {
  id: string;
  name: string;
  description: string;
  domainId: string;
  totalQuestions: number;
  duration: number;
  marksPerQuestion: number;
  negativeMarksRatio: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  topicFilter: string[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
