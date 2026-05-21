import { apiClient } from '../../../lib/api/client';
import type { AdminQuestionInput } from '../../../lib/validators/adminQuestion';

export async function createAdminQuestion(
  input: AdminQuestionInput,
  _uid: string, // userId is derived server-side from the auth session
): Promise<string> {
  const res = await apiClient.post<{ id: string }>('/questions', {
    domainId: input.domain,
    topicId: input.topic,
    subtopicId: input.subtopic,
    type: input.type,
    difficulty: input.difficulty,
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
