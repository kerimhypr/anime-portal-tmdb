import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// cizbull project – fully functional Auth + Firestore (anime-portal-tmdb-2026 hosting will use same via authorizedDomains)
const firebaseConfig = {
  apiKey: "AIzaSyAXcTKy3Iyt5cDB0yV8z0TIUbkGsajNwZE",
  authDomain: "cizbull.firebaseapp.com",
  projectId: "cizbull",
  storageBucket: "cizbull.firebasestorage.app",
  messagingSenderId: "119509862971",
  appId: "1:119509862971:web:28b8a0bbb6b1c758062a1e",
  databaseURL: "https://cizbull-default-rtdb.europe-west1.firebasedatabase.app",
};

// Fallback config for anime-portal host (if you prefer to isolate, but we reuse cizbull to keep Auth working cross-host)
// To switch to anime-portal-tmdb-2026 project's Firestore/Auth once its Identity Toolkit config is created, just change projectId/apiKey.
// See src/lib/firebase.ts header for docs.

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
// Force language
auth.useDeviceLanguage();
