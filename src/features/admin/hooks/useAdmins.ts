import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

export interface AdminRecord {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export function useAdmins() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: async (): Promise<AdminRecord[]> => {
      const res = await apiClient.get<AdminRecord[]>('/admins');
      return res.data as AdminRecord[];
    },
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { username: string; password: string }) => {
      const res = await apiClient.post<AdminRecord>('/admins', dto);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  });
}

export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admins/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  });
}
