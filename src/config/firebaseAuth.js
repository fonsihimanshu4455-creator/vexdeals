// Separate Firebase app used ONLY for phone-OTP auth. This lets us run phone
// sign-in from a project YOU own (where Phone provider can be enabled), while
// all the store data keeps living in the main project. Fill these from your new
// Firebase project's web-app config (public values — safe in client code).
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { auth as mainAuth } from './firebase';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_AUTH_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_AUTH_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_AUTH_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_AUTH_MESSAGING_SENDER_ID,
};

const ready = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);

let authApp = null;
if (ready) {
  const NAME = 'vexAuth';
  authApp = getApps().find((a) => a.name === NAME) || initializeApp(cfg, NAME);
}

// Falls back to the main auth if the dedicated project isn't configured yet
// (so the app never crashes — phone OTP just won't work until env vars are set).
export const phoneAuth = authApp ? getAuth(authApp) : mainAuth;
export const phoneAuthReady = ready;
