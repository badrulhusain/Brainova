import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

export function useCreateDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; description: string; icon: string; order: number }) =>
      apiClient.post('/domains', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-taxonomy'] }),
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ domainId, ...dto }: { domainId: string; name: string; description: string; order: number }) =>
      apiClient.post(`/domains/${domainId}/topics`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-taxonomy'] }),
  });
}

export function useCreateSubtopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ domainId, topicId, ...dto }: { domainId: string; topicId: string; name: string; description: string; order: number }) =>
      apiClient.post(`/domains/${domainId}/topics/${topicId}/subtopics`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-taxonomy'] }),
  });
}
