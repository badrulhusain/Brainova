import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as functionsV1 from 'firebase-functions/v1';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { setUserRoleSchema } from './validators.js';

initializeApp();

export const adminAuth = getAuth();
const db = getFirestore();

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

export const setUserRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  if (request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Only admins can change user roles.');
  }

  const parsed = setUserRoleSchema.safeParse(request.data);

  if (!parsed.success) {
    throw new HttpsError('invalid-argument', 'Invalid role payload.', parsed.error.flatten());
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
