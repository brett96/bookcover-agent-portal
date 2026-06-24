import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let firestore: Firestore | null | undefined;

function parseServiceAccount():
  | { projectId: string; clientEmail: string; privateKey: string }
  | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const json = JSON.parse(raw) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (!json.project_id || !json.client_email || !json.private_key) return null;
    return {
      projectId: json.project_id,
      clientEmail: json.client_email,
      privateKey: json.private_key,
    };
  } catch {
    return null;
  }
}

export function getFirebaseApp(): App | null {
  const creds = parseServiceAccount();
  if (!creds) return null;
  const existing = getApps()[0];
  if (existing) return existing;
  return initializeApp({
    credential: cert({
      projectId: creds.projectId,
      clientEmail: creds.clientEmail,
      privateKey: creds.privateKey,
    }),
  });
}

export function getFirestoreDb(): Firestore | null {
  if (firestore !== undefined) return firestore;
  const app = getFirebaseApp();
  firestore = app ? getFirestore(app) : null;
  return firestore;
}

export function isFirebaseConfigured(): boolean {
  return getFirestoreDb() !== null;
}
