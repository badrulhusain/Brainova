import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import type { AdminDomain } from '../types';

export function useAdminTaxonomy() {
  return useQuery({
    queryKey: ['admin-taxonomy'],
    queryFn: async (): Promise<AdminDomain[]> => {
      const domainsRes = await apiClient.get<AdminDomain[]>('/domains');
      const domains = domainsRes.data as AdminDomain[];

      // Fetch topics (with nested subtopics) for every domain in parallel
      const enriched = await Promise.all(
        domains.map(async (domain) => {
          const topicsRes = await apiClient.get(`/domains/${domain.id}/topics`);
          return { ...domain, topics: topicsRes.data as AdminDomain['topics'] };
        }),
      );

      return enriched.sort((a, b) => a.order - b.order);
    },
  });
}
