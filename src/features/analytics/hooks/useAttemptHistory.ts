import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import type { TestAttemptSummary } from '../../test-taking/types';

const PAGE_SIZE = 10;

interface AttemptsPage {
  items: TestAttemptSummary[];
  page: number;
  totalPages: number;
}

export function useAttemptHistory(uid: string) {
  return useInfiniteQuery({
    queryKey: ['attempt-history', uid],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await apiClient.get<AttemptsPage>('/analytics/attempts', {
        params: { page: pageParam, limit: PAGE_SIZE },
      });
      const data = res.data as AttemptsPage;
      return {
        attempts: data.items,
        hasMore: data.page < data.totalPages,
        nextPage: data.page + 1,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
  });
}
