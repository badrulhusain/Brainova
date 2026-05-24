import { useQuery } from '@tanstack/react-query';
import { getLatestResult } from '../services/aptitude.service';

export function useLatestAptitudeResult() {
  return useQuery({
    queryKey: ['aptitude-result-latest'],
    queryFn: getLatestResult,
    staleTime: 0,
  });
}
