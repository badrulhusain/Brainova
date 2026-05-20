import { initializeApp, type AppOptions } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';

const envLocalPath = new URL('../.env.local', import.meta.url);
const envLocalProjectId = existsSync(envLocalPath)
  ? readFileSync(envLocalPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith('VITE_FIREBASE_PROJECT_ID='))
      ?.replace('VITE_FIREBASE_PROJECT_ID=', '')
  : undefined;
const projectId = process.env.FIREBASE_PROJECT_ID ?? envLocalProjectId;
const target = process.argv[2];

if (!target) {
  process.stderr.write('Usage: npm run admin:grant -- <email-or-uid>\n');
  process.exit(1);
}

const appOptions: AppOptions = {};

if (projectId) {
  appOptions.projectId = projectId;
}

initializeApp(appOptions);

const auth = getAuth();
const db = getFirestore();

async function resolveUid(emailOrUid: string) {
  if (emailOrUid.includes('@')) {
    const user = await auth.getUserByEmail(emailOrUid);
    return user.uid;
  }

  return emailOrUid;
}

async function main() {
  const uid = await resolveUid(target);
  const user = await auth.getUser(uid);
  const existingClaims = user.customClaims ?? {};

  await auth.setCustomUserClaims(uid, {
    ...existingClaims,
    admin: true,
  });

  await db.doc(`users/${uid}`).set(
    {
      uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      role: 'admin',
      adminClaimUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  process.stdout.write(`Granted admin access to ${user.email ?? uid}.\n`);
  process.stdout.write('Sign out and sign back in so the browser receives the new admin claim.\n');
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown admin grant failure.';
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
