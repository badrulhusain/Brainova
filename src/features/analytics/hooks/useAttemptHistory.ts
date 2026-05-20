import { useInfiniteQuery } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { TestAttemptSummary } from '../../test-taking/types';

const PAGE_SIZE = 10;

function toAttemptSummary(
  id: string,
  data: Record<string, unknown>,
): TestAttemptSummary {
  return {
    id,
    domainId: data['domainId'] as string,
    configId: data['configId'] as string,
    resultId: data['resultId'] as string,
    score: data['score'] as number,
    totalMarks: data['totalMarks'] as number,
    accuracy: data['accuracy'] as number,
    correctCount: data['correctCount'] as number,
    totalQuestions: data['totalQuestions'] as number,
    date: data['date'] as Timestamp,
  };
}

export function useAttemptHistory(uid: string) {
  return useInfiniteQuery({
    queryKey: ['attempt-history', uid],
    initialPageParam: null as QueryDocumentSnapshot | null,
    queryFn: async ({ pageParam }) => {
      let q = query(
        collection(db, 'users', uid, 'test_attempts'),
        orderBy('date', 'desc'),
        limit(PAGE_SIZE),
      );

      if (pageParam) {
        q = query(
          collection(db, 'users', uid, 'test_attempts'),
          orderBy('date', 'desc'),
          startAfter(pageParam),
          limit(PAGE_SIZE),
        );
      }

      const snap = await getDocs(q);
      const attempts = snap.docs.map((d) =>
        toAttemptSummary(d.id, d.data() as Record<string, unknown>),
      );
      const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

      return { attempts, lastDoc, hasMore: snap.docs.length === PAGE_SIZE };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
  });
}
