import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTestConfig,
  getActiveTestConfigs,
  getAllTestConfigs,
  toggleTestConfigActive,
} from '../services/testConfigService';
import type { TestConfigInput } from '../../../lib/validators/testConfig';
import { useAuth } from '../../auth/AuthProvider';

export function useActiveTestConfigs() {
  return useQuery({
    queryKey: ['test-configs', 'active'],
    queryFn: getActiveTestConfigs,
  });
}

export function useAllTestConfigs() {
  return useQuery({
    queryKey: ['test-configs', 'all'],
    queryFn: getAllTestConfigs,
  });
}

export function useCreateTestConfig() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: TestConfigInput) => {
      if (!user) throw new Error('Not authenticated');
      return createTestConfig(input, user.uid);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['test-configs'] });
    },
  });
}

export function useToggleTestConfigActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleTestConfigActive(id, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['test-configs'] });
    },
  });
}
