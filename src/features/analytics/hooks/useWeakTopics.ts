import { useQuery } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { TopicResultSummary } from '../../test-taking/types';

interface WeakTopic {
  topicId: string;
  correct: number;
  total: number;
  accuracy: number;
}

export function useWeakTopics(uid: string) {
  return useQuery({
    queryKey: ['weak-topics', uid],
    queryFn: async () => {
      // Fetch last 10 attempt summaries to get result IDs
      const attemptsSnap = await getDocs(
        query(
          collection(db, 'users', uid, 'test_attempts'),
          orderBy('date', 'desc'),
          limit(10),
        ),
      );

      if (attemptsSnap.empty) return [];

      const resultIds = attemptsSnap.docs.map((d) => d.data()['resultId'] as string);

      // Aggregate topicBreakdown from each result doc
      const topicMap: Record<string, { correct: number; total: number }> = {};

      await Promise.all(
        resultIds.map(async (resultId) => {
          const snap = await getDoc(doc(db, 'results', resultId));
          if (!snap.exists()) return;

          const data = snap.data() as {
            topicBreakdown?: Record<string, TopicResultSummary>;
          };
          const breakdown = data.topicBreakdown ?? {};

          for (const [topicId, summary] of Object.entries(breakdown)) {
            if (!topicMap[topicId]) {
              topicMap[topicId] = { correct: 0, total: 0 };
            }
            const entry = topicMap[topicId]!;
            entry.correct += summary.correct;
            entry.total += summary.total;
          }
        }),
      );

      const topics: WeakTopic[] = Object.entries(topicMap).map(([topicId, stats]) => ({
        topicId,
        correct: stats.correct,
        total: stats.total,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
      }));

      // Sort ascending — lowest accuracy first
      topics.sort((a, b) => a.accuracy - b.accuracy);

      return topics.slice(0, 3);
    },
    enabled: Boolean(uid),
  });
}
