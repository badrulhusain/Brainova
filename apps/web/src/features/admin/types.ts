import type { Domain, Subtopic, Topic } from '../test-taking/types';

export interface AdminTopic extends Topic {
  subtopics: Subtopic[];
}

export interface AdminDomain extends Domain {
  topics: AdminTopic[];
}

export interface StudentRecord {
  id: string;
  name: string;
  admissionNo: string;
  department?: string | null;
  batch?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminResultRecord {
  id: string;
  studentId: string;
  student: StudentRecord | null;
  domainId: string;
  domain: Domain | null;
  configId: string;
  config: {
    id: string;
    name: string;
  } | null;
  scoredMarks: number;
  totalMarks: number;
  percentageScore: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  totalQuestions: number;
  createdAt: string;
  submittedAt: string | null;
}

export interface AdminResultsResponse {
  items: AdminResultRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
