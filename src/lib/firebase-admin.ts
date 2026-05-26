import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function parseServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON');
    return null;
  }
}

export function getAdminApp(): App | null {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0]!;
    return adminApp;
  }

  const serviceAccount = parseServiceAccount();
  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return adminApp;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  // Token verification works with project ID only; Firestore reads need a service account.
  adminApp = initializeApp({ projectId });
  return adminApp;
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  if (!app) return null;

  if (!adminAuth) {
    adminAuth = getAuth(app);
  }
  return adminAuth;
}

export function getAdminFirestore(): Firestore | null {
  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) return null;

  const app = getAdminApp();
  if (!app) return null;

  if (!adminDb) {
    adminDb = getFirestore(app);
  }
  return adminDb;
}

export function isAdminFirestoreAvailable(): boolean {
  return !!parseServiceAccount();
}
