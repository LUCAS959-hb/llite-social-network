import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase app instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore database instance
export const firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Alias 'db' for compatibility across the application
export const db = firestore;

// Helper to determine if real Firebase credentials are configured
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig &&
      firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.apiKey.trim().length > 0 &&
      firebaseConfig.projectId.trim().length > 0
  );
};

export default app;
