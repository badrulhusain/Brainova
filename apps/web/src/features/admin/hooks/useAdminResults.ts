import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import type { AdminResultsResponse } from '../types';
import type { TestResult } from '../../test-taking/types';

export function useAdminResults(page = 1, limit = 25) {
  return useQuery({
    queryKey: ['admin-results', page, limit],
    queryFn: async (): Promise<AdminResultsResponse> => {
      const res = await apiClient.get<AdminResultsResponse>('/results/admin/all', {
        params: { page, limit },
      });
      return res.data;
    },
  });
}

export function useAdminTestResult(resultId: string) {
  return useQuery({
    queryKey: ['admin-result', resultId],
    queryFn: async (): Promise<TestResult> => {
      const res = await apiClient.get<TestResult>(`/results/admin/${resultId}`);
      return res.data;
    },
    enabled: Boolean(resultId),
    staleTime: Infinity,
  });
}
