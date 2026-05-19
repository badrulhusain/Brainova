export function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('CONFIGURATION_NOT_FOUND')) {
    return 'Firebase Auth is not configured for this project. Check that the .env.local Firebase web app values match your Firebase project and enable the selected sign-in provider in Firebase Console.';
  }

  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return 'Something went wrong. Please try again.';
  }

  const code = String(error.code);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.';
    case 'auth/configuration-not-found':
      return 'Firebase Auth configuration was not found. Verify the Firebase web app config and enable Authentication sign-in providers in Firebase Console.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is disabled in Firebase Console.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before it finished.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/requires-recent-login':
      return 'Please log in again before continuing.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
