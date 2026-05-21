import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

interface WeakTopic {
  topicId: string;
  topicName: string;
  correct: number;
  attempted: number;
  accuracy: number;
  domainId: string;
}

export function useWeakTopics(uid: string) {
  return useQuery({
    queryKey: ['weak-topics', uid],
    queryFn: async (): Promise<WeakTopic[]> => {
      const res = await apiClient.get<WeakTopic[]>('/analytics/weak-topics');
      return res.data as WeakTopic[];
    },
    enabled: Boolean(uid),
  });
}
