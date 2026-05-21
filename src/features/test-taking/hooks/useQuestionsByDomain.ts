import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import type { PublicQuestion } from '../types';

export function useQuestionsByDomain(domainId: string | null) {
  return useQuery({
    enabled: Boolean(domainId),
    queryKey: ['questions', domainId],
    queryFn: async () => {
      if (!domainId) return [];
      const res = await apiClient.get<{ items: PublicQuestion[] }>('/questions', {
        params: { domainId, active: 'true', limit: 200 },
      });
      return (res.data as { items: PublicQuestion[] }).items;
    },
  });
}
