import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import type { TestResult } from '../../test-taking/types';

export function useTestResult(resultId: string) {
  return useQuery({
    queryKey: ['results', resultId],
    queryFn: async (): Promise<TestResult> => {
      const res = await apiClient.get<TestResult>(`/results/${resultId}`);
      return res.data as TestResult;
    },
    staleTime: Infinity, // results are immutable
    enabled: Boolean(resultId),
  });
}
