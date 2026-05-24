import { useQuery } from '@tanstack/react-query';
import { getAptitudeQuestions } from '../services/aptitude.service';

export function useAptitudeQuestions() {
  return useQuery({
    queryKey: ['aptitude-questions'],
    queryFn: getAptitudeQuestions,
    enabled: false,
    staleTime: 0,
  });
}
