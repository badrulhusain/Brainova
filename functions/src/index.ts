import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as functionsV1 from 'firebase-functions/v1';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import {
  setUserRoleSchema,
  createTestSessionSchema,
  submitTestSchema,
} from './validators.js';

initializeApp();

export const adminAuth = getAuth();
const db = getFirestore();

// ─── Utility: Fisher-Yates shuffle ────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j] as T;
    copy[j] = temp as T;
  }
  return copy;
}

// ─── onUserCreate ──────────────────────────────────────────────────────────────
export const onUserCreate = functionsV1.auth.user().onCreate(async (user) => {
  await db.doc(`users/${user.uid}`).set(
    {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      isAnonymous: user.providerData.length === 0,
      onboardingStatus: 'not_started',
      guestTestsUsed: user.providerData.length === 0 ? 0 : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
});

// ─── setUserRole ───────────────────────────────────────────────────────────────
export const setUserRole = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  if (request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Only admins can change user roles.');
  }

  const parsed = setUserRoleSchema.safeParse(request.data);

  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid role payload.');
  }

  await adminAuth.setCustomUserClaims(parsed.data.uid, {
    admin: parsed.data.admin,
  });

  await db.doc(`users/${parsed.data.uid}`).set(
    {
      adminClaimUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    uid: parsed.data.uid,
    admin: parsed.data.admin,
  };
});

// ─── createTestSession ─────────────────────────────────────────────────────────
export const createTestSession = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const uid = request.auth.uid;
  const parsed = createTestSessionSchema.safeParse(request.data);

  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid input.');
  }

  const { configId } = parsed.data;

  // 1. Read config
  const configSnap = await db.doc(`test_configs/${configId}`).get();
  if (!configSnap.exists) {
    throw new HttpsError('not-found', 'Test configuration not found.');
  }

  const config = configSnap.data() as {
    active: boolean;
    domainId: string;
    totalQuestions: number;
    duration: number;
    marksPerQuestion: number;
    negativeMarksRatio: number;
    difficultyDistribution: { easy: number; medium: number; hard: number };
    topicFilter: string[];
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };

  if (!config.active) {
    throw new HttpsError('not-found', 'This test is not currently available.');
  }

  // 2. Check for existing in_progress session
  const existingSnap = await db
    .collection('test_sessions')
    .where('ownerUid', '==', uid)
    .where('configId', '==', configId)
    .where('status', '==', 'in_progress')
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    throw new HttpsError('already-exists', 'You already have an active session for this test.');
  }

  // 3. Query questions by difficulty (3 separate queries)
  const difficulties = ['easy', 'medium', 'hard'] as const;
  const counts = {
    easy: config.difficultyDistribution.easy,
    medium: config.difficultyDistribution.medium,
    hard: config.difficultyDistribution.hard,
  };

  const questionBuckets: Record<string, Array<Record<string, unknown>>> = {};

  for (const difficulty of difficulties) {
    const needed = counts[difficulty];
    if (needed === 0) {
      questionBuckets[difficulty] = [];
      continue;
    }

    let q = db
      .collection('questions')
      .where('domain', '==', config.domainId)
      .where('active', '==', true)
      .where('difficulty', '==', difficulty)
      .orderBy('createdAt', 'desc');

    if (config.topicFilter.length > 0) {
      q = q.where('topic', 'in', config.topicFilter);
    }

    const snap = await q.get();
    const allDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (allDocs.length < needed) {
      throw new HttpsError(
        'resource-exhausted',
        `Not enough ${difficulty} questions available. Need ${needed}, found ${allDocs.length}.`,
      );
    }

    questionBuckets[difficulty] = allDocs as Array<Record<string, unknown>>;
  }

  // 4. Shuffle each bucket and slice to needed count
  const selectedQuestions: Array<Record<string, unknown>> = [];
  for (const difficulty of difficulties) {
    const bucket = questionBuckets[difficulty] ?? [];
    const needed = counts[difficulty];
    const shuffled = shuffleArray(bucket);
    selectedQuestions.push(...shuffled.slice(0, needed));
  }

  // 5. Optionally shuffle all questions together
  const finalQuestions = config.shuffleQuestions
    ? shuffleArray(selectedQuestions)
    : selectedQuestions;

  // 6. Build snapshot — strip correctAnswer, explanation; optionally shuffle options
  const questionSnapshot = finalQuestions.map((q) => {
    let options = (q['options'] as string[]) ?? [];
    if (config.shuffleOptions && options.length > 1) {
      options = shuffleArray(options);
    }
    return {
      id: q['id'] as string,
      domain: q['domain'] as string,
      topic: q['topic'] as string,
      subtopic: q['subtopic'] as string,
      type: q['type'] as string,
      difficulty: q['difficulty'] as string,
      text: q['text'] as string,
      options,
      marks: q['marks'] as number,
      negativeMarks: q['negativeMarks'] as number,
      tags: (q['tags'] as string[]) ?? [],
    };
  });

  // 7. Write session document
  const expiresAt = new Date(Date.now() + config.duration * 1000);
  const sessionRef = db.collection('test_sessions').doc();

  await sessionRef.set({
    id: sessionRef.id,
    ownerUid: uid,
    configId,
    domainId: config.domainId,
    status: 'in_progress',
    startedAt: FieldValue.serverTimestamp(),
    expiresAt,
    duration: config.duration,
    questionSnapshot,
    answers: {},
    markedForReview: {},
    tabSwitchCount: 0,
    questionCount: questionSnapshot.length,
    lastSavedAt: FieldValue.serverTimestamp(),
  });

  return { sessionId: sessionRef.id };
});

// ─── submitTest ────────────────────────────────────────────────────────────────
export const submitTest = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const uid = request.auth.uid;
  const parsed = submitTestSchema.safeParse(request.data);

  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid input.');
  }

  const { sessionId } = parsed.data;

  // 1. Read session and verify ownership + status
  const sessionRef = db.doc(`test_sessions/${sessionId}`);
  const sessionSnap = await sessionRef.get();

  if (!sessionSnap.exists) {
    throw new HttpsError('not-found', 'Session not found.');
  }

  const session = sessionSnap.data() as {
    ownerUid: string;
    configId: string;
    domainId: string;
    status: string;
    questionSnapshot: Array<{
      id: string;
      topic: string;
      subtopic: string;
      difficulty: string;
      type: string;
      text: string;
      options: string[];
      marks: number;
      negativeMarks: number;
    }>;
    answers: Record<string, string>;
    markedForReview: Record<string, boolean>;
    tabSwitchCount: number;
    startedAt: FirebaseFirestore.Timestamp;
  };

  if (session.ownerUid !== uid) {
    throw new HttpsError('permission-denied', 'You do not own this session.');
  }

  if (session.status !== 'in_progress') {
    throw new HttpsError('already-exists', 'This session has already been submitted.');
  }

  // 2. Read config for scoring params
  const configSnap = await db.doc(`test_configs/${session.configId}`).get();
  const config = configSnap.data() as {
    marksPerQuestion: number;
    negativeMarksRatio: number;
  };

  const marksPerQuestion = config.marksPerQuestion;
  const negativeMarks = marksPerQuestion * config.negativeMarksRatio;

  // 3. Optimistic lock — set status to 'scoring'
  await sessionRef.update({ status: 'scoring' });

  // 4. Batch-fetch all answer keys
  const questionIds = session.questionSnapshot.map((q) => q.id);
  const answerKeyRefs = questionIds.map((id) => db.collection('answer_keys').doc(id));
  const answerKeySnaps = await db.getAll(...answerKeyRefs);

  const answerKeyMap: Record<string, { correctAnswer: string; explanation: string }> = {};
  for (const snap of answerKeySnaps) {
    if (snap.exists) {
      const data = snap.data() as { correctAnswer: string; explanation: string };
      answerKeyMap[snap.id] = data;
    }
  }

  // 5. Score each question
  let scoredMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const topicBreakdown: Record<
    string,
    { total: number; attempted: number; correct: number; incorrect: number; skipped: number; accuracy: number }
  > = {};
  const difficultyBreakdown: Record<
    string,
    { total: number; correct: number; incorrect: number; skipped: number }
  > = {};

  const questionResults = session.questionSnapshot.map((q) => {
    const userAnswer = session.answers[q.id] ?? '';
    const answerKey = answerKeyMap[q.id];
    const correctAnswer = answerKey?.correctAnswer ?? '';
    const explanation = answerKey?.explanation ?? '';

    const isSkipped = userAnswer === '';
    const isCorrect = !isSkipped && userAnswer === correctAnswer;

    let marksEarned: number;
    if (isSkipped) {
      marksEarned = 0;
      skippedCount++;
    } else if (isCorrect) {
      marksEarned = marksPerQuestion;
      correctCount++;
    } else {
      marksEarned = -negativeMarks;
      incorrectCount++;
    }

    scoredMarks += marksEarned;

    // Topic breakdown
    const topicId = q.topic;
    if (!topicBreakdown[topicId]) {
      topicBreakdown[topicId] = {
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        accuracy: 0,
      };
    }
    const tb = topicBreakdown[topicId]!;
    tb.total++;
    if (!isSkipped) tb.attempted++;
    if (isCorrect) tb.correct++;
    else if (!isSkipped) tb.incorrect++;
    else tb.skipped++;

    // Difficulty breakdown
    const diff = q.difficulty;
    if (!difficultyBreakdown[diff]) {
      difficultyBreakdown[diff] = { total: 0, correct: 0, incorrect: 0, skipped: 0 };
    }
    const db2 = difficultyBreakdown[diff]!;
    db2.total++;
    if (isCorrect) db2.correct++;
    else if (!isSkipped) db2.incorrect++;
    else db2.skipped++;

    return {
      questionId: q.id,
      questionText: q.text,
      options: q.options,
      type: q.type,
      difficulty: q.difficulty,
      topicId,
      subtopicId: q.subtopic,
      userAnswer,
      correctAnswer,
      isCorrect,
      isSkipped,
      explanation,
      marksEarned,
    };
  });

  // Compute topic accuracy
  for (const topicId of Object.keys(topicBreakdown)) {
    const tb = topicBreakdown[topicId]!;
    tb.accuracy = tb.attempted > 0 ? tb.correct / tb.attempted : 0;
  }

  const totalMarks = questionIds.length * marksPerQuestion;
  const attemptedCount = correctCount + incorrectCount;
  const accuracy = attemptedCount > 0 ? correctCount / attemptedCount : 0;
  const finalScore = Math.max(0, scoredMarks);
  const percentageScore = totalMarks > 0 ? (finalScore / totalMarks) * 100 : 0;

  // 6. Write results doc
  const resultRef = db.collection('results').doc();
  const resultId = resultRef.id;

  await resultRef.set({
    id: resultId,
    ownerUid: uid,
    sessionId,
    configId: session.configId,
    domainId: session.domainId,
    totalMarks,
    scoredMarks: finalScore,
    percentageScore,
    totalQuestions: questionIds.length,
    attemptedCount,
    correctCount,
    incorrectCount,
    skippedCount,
    accuracy,
    topicBreakdown,
    difficultyBreakdown,
    questionResults,
    createdAt: FieldValue.serverTimestamp(),
  });

  // 7. Write attempt summary to user subcollection
  await db.doc(`users/${uid}/test_attempts/${resultId}`).set({
    id: resultId,
    domainId: session.domainId,
    configId: session.configId,
    resultId,
    score: finalScore,
    totalMarks,
    accuracy,
    correctCount,
    totalQuestions: questionIds.length,
    date: FieldValue.serverTimestamp(),
  });

  // 8. Update session status
  await sessionRef.update({
    status: 'submitted',
    submittedAt: FieldValue.serverTimestamp(),
    resultId,
  });

  // 9. Increment aggregates
  const aggregateRef = db.doc(`aggregates/domain_${session.domainId}`);
  await aggregateRef.set(
    {
      attemptCount: FieldValue.increment(1),
      totalScore: FieldValue.increment(finalScore),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { resultId };
});
