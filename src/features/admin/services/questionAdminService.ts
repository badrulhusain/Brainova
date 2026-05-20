import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../../lib/firebase/client';
import type { AdminQuestionInput } from '../../../lib/validators/adminQuestion';

export async function createAdminQuestion(input: AdminQuestionInput, uid: string) {
  const questionRef = doc(collection(db, 'questions'));
  const batch = writeBatch(db);

  batch.set(questionRef, {
    id: questionRef.id,
    domain: input.domain,
    topic: input.topic,
    subtopic: input.subtopic,
    type: input.type,
    difficulty: input.difficulty,
    text: input.text,
    options: input.options,
    marks: input.marks,
    negativeMarks: input.negativeMarks,
    timeRecommended: input.timeRecommended,
    tags: input.tags,
    active: input.active,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: uid,
    updatedBy: uid,
  });

  batch.set(doc(db, 'answer_keys', questionRef.id), {
    questionId: questionRef.id,
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  });

  await batch.commit();

  return questionRef.id;
}
