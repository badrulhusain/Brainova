import { apiClient } from '../../../lib/api/client';
import type { AptitudeQuestion, AptitudeResult } from '../types';

export async function getAptitudeQuestions(): Promise<AptitudeQuestion[]> {
  const res = await apiClient.get<AptitudeQuestion[]>('/aptitude/questions');
  return res.data as AptitudeQuestion[];
}

export async function submitAptitude(answers: Record<string, string>): Promise<AptitudeResult> {
  const res = await apiClient.post<AptitudeResult>('/aptitude/submit', { answers });
  return res.data as AptitudeResult;
}

export async function getLatestResult(): Promise<AptitudeResult | null> {
  const res = await apiClient.get<AptitudeResult | null>('/aptitude/result/latest');
  return res.data as AptitudeResult | null;
}

export async function getResultById(id: string): Promise<AptitudeResult> {
  const res = await apiClient.get<AptitudeResult>(`/aptitude/result/${id}`);
  return res.data as AptitudeResult;
}
