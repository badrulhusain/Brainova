import { apiClient } from '../../../lib/api/client';
import type { TestConfigInput } from '../../../lib/validators/testConfig';
import type { TestConfig } from '../types';

export async function getActiveTestConfigs(): Promise<TestConfig[]> {
  const res = await apiClient.get<TestConfig[]>('/test-configs');
  return res.data as TestConfig[];
}

export async function getAllTestConfigs(): Promise<TestConfig[]> {
  const res = await apiClient.get<TestConfig[]>('/test-configs');
  return res.data as TestConfig[];
}

export async function createTestConfig(
  input: TestConfigInput,
  _uid: string,
): Promise<string> {
  // Map frontend difficultyDistribution → backend flat fields
  const { difficultyDistribution, active: _active, ...rest } = input;
  const body = {
    ...rest,
    easyCount: difficultyDistribution.easy,
    mediumCount: difficultyDistribution.medium,
    hardCount: difficultyDistribution.hard,
  };
  const res = await apiClient.post<TestConfig>('/test-configs', body);
  return (res.data as TestConfig).id;
}

export async function toggleTestConfigActive(id: string, active: boolean): Promise<void> {
  await apiClient.patch(`/test-configs/${id}`, { active });
}
