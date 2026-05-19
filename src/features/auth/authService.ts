import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase/client';
import type { LoginFormValues, ResetPasswordFormValues, SignupFormValues } from '../../lib/validators/auth';
import { getAuthErrorMessage } from './firebaseErrors';

const googleProvider = new GoogleAuthProvider();

function profilePayload(user: User, displayNameOverride?: string) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: displayNameOverride ?? user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    updatedAt: serverTimestamp(),
  };
}

async function upsertUserProfile(user: User, displayNameOverride?: string) {
  await setDoc(
    doc(db, 'users', user.uid),
    {
      ...profilePayload(user, displayNameOverride),
      createdAt: serverTimestamp(),
      onboardingStatus: 'not_started',
      guestTestsUsed: user.isAnonymous ? 0 : null,
    },
    { merge: true },
  );
}

async function prepareAuthPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

export async function loginWithEmail(values: LoginFormValues) {
  try {
    await prepareAuthPersistence();
    const credential = await signInWithEmailAndPassword(auth, values.email, values.password);
    await upsertUserProfile(credential.user);
    return credential.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signupWithEmail(values: SignupFormValues) {
  try {
    await prepareAuthPersistence();
    const credential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    await updateProfile(credential.user, { displayName: values.displayName });
    await upsertUserProfile(credential.user, values.displayName);
    await sendEmailVerification(credential.user);
    return credential.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function loginWithGoogle() {
  try {
    await prepareAuthPersistence();
    const credential = await signInWithPopup(auth, googleProvider);
    await upsertUserProfile(credential.user);
    return credential.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function continueAsGuest() {
  try {
    await prepareAuthPersistence();
    const credential = await signInAnonymously(auth);
    await upsertUserProfile(credential.user);
    return credential.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function requestPasswordReset(values: ResetPasswordFormValues) {
  try {
    await sendPasswordResetEmail(auth, values.email);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function resendVerificationEmail(user: User) {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}
