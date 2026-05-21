import { apiClient } from '../../../lib/api/client';
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
  input: Omit<TestConfig, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'domain'>,
  _uid: string, // userId is derived server-side from the auth session
): Promise<string> {
  const res = await apiClient.post<TestConfig>('/test-configs', input);
  return (res.data as TestConfig).id;
}

export async function toggleTestConfigActive(id: string, active: boolean): Promise<void> {
  await apiClient.patch(`/test-configs/${id}`, { active });
}
