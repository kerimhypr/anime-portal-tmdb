import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// anime-portal-tmdb-2026 – PRIMARY project (hosting + Firestore). Auth is CUSTOM via Firestore (no Identity Toolkit dependency) to avoid cizbull touch.
const firebaseConfig = {
  apiKey: "AIzaSyB1h8PIXvjUoMsIEa4WZAmUXJDNAKojjiE",
  authDomain: "anime-portal-tmdb-2026.firebaseapp.com",
  projectId: "anime-portal-tmdb-2026",
  storageBucket: "anime-portal-tmdb-2026.firebasestorage.app",
  messagingSenderId: "116833109660",
  appId: "1:116833109660:web:6d699ae40113b3a6410f59",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
