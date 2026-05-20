import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { PublicQuestion } from '../types';

export function useQuestionCountsByDomain() {
  return useQuery({
    queryKey: ['question-counts-by-domain'],
    queryFn: async () => {
      const questionsQuery = query(collection(db, 'questions'), where('active', '==', true));
      const snapshot = await getDocs(questionsQuery);

      return snapshot.docs.reduce<Record<string, number>>((counts, document) => {
        const question = document.data() as Pick<PublicQuestion, 'domain'>;

        return {
          ...counts,
          [question.domain]: (counts[question.domain] ?? 0) + 1,
        };
      }, {});
    },
  });
}
