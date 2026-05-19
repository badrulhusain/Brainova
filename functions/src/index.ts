import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp();

export const adminAuth = getAuth();

export const helloWorld = async () => {
  return {
    status: 'ok',
    message: 'Functions scaffold ready',
  };
};
