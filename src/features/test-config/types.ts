import type { ISODate } from '../test-taking/types';

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
  createdAt: ISODate;
  updatedAt: ISODate;
  createdBy: string;
  domain?: { id: string; name: string; icon: string };
}
