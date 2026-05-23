import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

export function useQuestionCountsByDomain() {
  return useQuery({
    queryKey: ['question-counts-by-domain'],
    queryFn: async () => {
      const res = await apiClient.get<{ items: { domainId: string }[]; total: number }>(
        '/questions',
        { params: { active: 'true', limit: 1000 } },
      );
      const items = (res.data as { items: { domainId: string }[] }).items;
      return items.reduce<Record<string, number>>((acc, q) => {
        acc[q.domainId] = (acc[q.domainId] ?? 0) + 1;
        return acc;
      }, {});
    },
  });
}
