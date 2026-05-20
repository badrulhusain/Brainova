import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { TestResult } from '../../test-taking/types';

function toTestResult(id: string, data: Record<string, unknown>): TestResult {
  return {
    id,
    ownerUid: data['ownerUid'] as string,
    sessionId: data['sessionId'] as string,
    configId: data['configId'] as string,
    domainId: data['domainId'] as string,
    totalMarks: data['totalMarks'] as number,
    scoredMarks: data['scoredMarks'] as number,
    percentageScore: data['percentageScore'] as number,
    totalQuestions: data['totalQuestions'] as number,
    attemptedCount: data['attemptedCount'] as number,
    correctCount: data['correctCount'] as number,
    incorrectCount: data['incorrectCount'] as number,
    skippedCount: data['skippedCount'] as number,
    accuracy: data['accuracy'] as number,
    topicBreakdown: data['topicBreakdown'] as TestResult['topicBreakdown'],
    difficultyBreakdown: data['difficultyBreakdown'] as TestResult['difficultyBreakdown'],
    questionResults: data['questionResults'] as TestResult['questionResults'],
    createdAt: data['createdAt'] as Timestamp,
  };
}

export function useTestResult(resultId: string) {
  return useQuery({
    queryKey: ['results', resultId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'results', resultId));
      if (!snap.exists()) throw new Error('Result not found.');
      return toTestResult(snap.id, snap.data() as Record<string, unknown>);
    },
    staleTime: Infinity, // results are immutable
  });
}
