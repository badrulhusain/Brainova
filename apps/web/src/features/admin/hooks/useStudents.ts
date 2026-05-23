import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import type { StudentRecord } from '../types';

export interface StudentFilters {
  department?: string;
  batch?: string;
  active?: boolean;
}

export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: async (): Promise<StudentRecord[]> => {
      const params = new URLSearchParams();
      if (filters.department) params.set('department', filters.department);
      if (filters.batch) params.set('batch', filters.batch);
      if (filters.active !== undefined) params.set('active', String(filters.active));

      const path = params.size > 0 ? `/students?${params.toString()}` : '/students';
      const res = await apiClient.get<StudentRecord[]>(path);
      return res.data;
    },
  });
}
