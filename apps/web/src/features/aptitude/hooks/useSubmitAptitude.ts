import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { submitAptitude } from '../services/aptitude.service';

export function useSubmitAptitude() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAptitude,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['aptitude-result-latest'] });
    },
  });
}
