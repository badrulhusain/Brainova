import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { PublicQuestion, QuestionDifficulty } from '../types';

const difficultyOrder: Record<QuestionDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

const questionConverter = (id: string, data: Omit<PublicQuestion, 'id'>): PublicQuestion => ({
  id,
  domain: data.domain,
  topic: data.topic,
  subtopic: data.subtopic,
  type: data.type,
  difficulty: data.difficulty,
  text: data.text,
  options: data.options,
  marks: data.marks,
  negativeMarks: data.negativeMarks,
  timeRecommended: data.timeRecommended,
  tags: data.tags,
  active: data.active,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  createdBy: data.createdBy,
  updatedBy: data.updatedBy,
});

export function useQuestionsByDomain(domainId: string | null) {
  return useQuery({
    enabled: Boolean(domainId),
    queryKey: ['questions', domainId],
    queryFn: async () => {
      if (!domainId) {
        return [];
      }

      const questionsQuery = query(collection(db, 'questions'), where('domain', '==', domainId), where('active', '==', true));
      const snapshot = await getDocs(questionsQuery);

      return snapshot.docs
        .map((document) => questionConverter(document.id, document.data() as Omit<PublicQuestion, 'id'>))
        .sort((first, second) => {
          const topicCompare = first.topic.localeCompare(second.topic);

          if (topicCompare !== 0) {
            return topicCompare;
          }

          return difficultyOrder[first.difficulty] - difficultyOrder[second.difficulty];
        });
    },
  });
}
