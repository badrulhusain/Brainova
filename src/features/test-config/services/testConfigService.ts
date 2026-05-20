import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { TestConfig } from '../types';
import type { TestConfigInput } from '../../../lib/validators/testConfig';

function toTestConfig(id: string, data: Record<string, unknown>): TestConfig {
  return {
    id,
    name: data['name'] as string,
    description: data['description'] as string,
    domainId: data['domainId'] as string,
    totalQuestions: data['totalQuestions'] as number,
    duration: data['duration'] as number,
    marksPerQuestion: data['marksPerQuestion'] as number,
    negativeMarksRatio: data['negativeMarksRatio'] as number,
    difficultyDistribution: data['difficultyDistribution'] as TestConfig['difficultyDistribution'],
    topicFilter: data['topicFilter'] as string[],
    shuffleQuestions: data['shuffleQuestions'] as boolean,
    shuffleOptions: data['shuffleOptions'] as boolean,
    active: data['active'] as boolean,
    createdAt: data['createdAt'] as Timestamp,
    updatedAt: data['updatedAt'] as Timestamp,
    createdBy: data['createdBy'] as string,
  };
}

export async function getActiveTestConfigs(): Promise<TestConfig[]> {
  const q = query(collection(db, 'test_configs'), where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => toTestConfig(d.id, d.data()));
}

export async function getAllTestConfigs(): Promise<TestConfig[]> {
  const snapshot = await getDocs(collection(db, 'test_configs'));
  return snapshot.docs.map((d) => toTestConfig(d.id, d.data()));
}

export async function createTestConfig(
  input: TestConfigInput,
  uid: string,
): Promise<string> {
  const ref = await addDoc(collection(db, 'test_configs'), {
    ...input,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function toggleTestConfigActive(
  id: string,
  active: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'test_configs', id), {
    active,
    updatedAt: serverTimestamp(),
  });
}
