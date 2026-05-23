import { apiClient } from '../../../lib/api/client';
import type { AdminQuestionInput } from '../../../lib/validators/adminQuestion';
import type { Subtopic, Topic } from '../../test-taking/types';

const typeMap = {
  mcq: 'MCQ',
  true_false: 'TRUE_FALSE',
  fill: 'FILL',
} as const;

const difficultyMap = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
} as const;

export async function createAdminQuestion(
  input: AdminQuestionInput,
  _uid: string, // userId is derived server-side from the auth session
): Promise<string> {
  const res = await apiClient.post<{ id: string }>('/questions', {
    domainId: input.domain,
    topicId: input.topic,
    subtopicId: input.subtopic,
    type: typeMap[input.type],
    difficulty: difficultyMap[input.difficulty],
    text: input.text,
    options: input.options,
    marks: input.marks,
    negativeMarks: input.negativeMarks,
    timeRecommended: input.timeRecommended,
    tags: input.tags,
    active: input.active,
    answerKey: {
      correctAnswer: input.correctAnswer,
      explanation: input.explanation,
    },
  });
  return (res.data as { id: string }).id;
}

export async function createAdminTopic(input: {
  domainId: string;
  name: string;
  order: number;
}): Promise<Topic> {
  const res = await apiClient.post<Topic>(`/domains/${input.domainId}/topics`, {
    name: input.name.trim(),
    description: `${input.name.trim()} questions`,
    order: input.order,
  });
  return res.data as Topic;
}

export async function createAdminSubtopic(input: {
  domainId: string;
  topicId: string;
  name: string;
  order: number;
}): Promise<Subtopic> {
  const res = await apiClient.post<Subtopic>(
    `/domains/${input.domainId}/topics/${input.topicId}/subtopics`,
    {
      name: input.name.trim(),
      description: `${input.name.trim()} questions`,
      order: input.order,
    },
  );
  return res.data as Subtopic;
}
