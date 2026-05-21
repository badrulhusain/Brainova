import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import type { Domain } from '../types';

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const res = await apiClient.get<Domain[]>('/domains');
      return (res.data as Domain[]).sort((a, b) => a.order - b.order);
    },
  });
}
