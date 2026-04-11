import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// All values come from environment variables — set them in Vercel dashboard
// and in a local .env file (see .env.example)
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyBVrk2cTyDCSJ_0xwWNPa9-ZvyzMhEGLjA',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'vexdeals-7b381.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'vexdeals-7b381',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'vexdeals-7b381.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '700443326824',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:700443326824:web:c5cca1a77c159d48747edd',
};

export const firebaseConfigReady = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0
);

const app = firebaseConfigReady
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;
