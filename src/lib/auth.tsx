"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db, googleProvider } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string;
  bio: string;
  bannerUrl: string;
  level: number;
  xp: number;
  badges: any[];
  createdAt: string;
};

type AuthCtx = {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateAppUser: (patch: Partial<AppUser>) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

async function ensureUserDoc(fu: FirebaseUser) {
  const ref = doc(db, "users", fu.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const username = (fu.displayName?.replace(/\s+/g, "").toLowerCase() || fu.email?.split("@")[0] || "user") + Math.floor(Math.random() * 900 + 100);
    const data: AppUser = {
      uid: fu.uid,
      email: fu.email,
      displayName: fu.displayName || fu.email?.split("@")[0] || "Otaku",
      photoURL: fu.photoURL || `https://i.pravatar.cc/300?u=${fu.uid}`,
      username,
      bio: "Anime sever • Profilini düzenle",
      bannerUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      level: 1,
      xp: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    // also create stats doc
    await setDoc(doc(db, "userStats", fu.uid), { totalCompleted: 0, currentlyWatching: 0, totalMinutes: 0 });
    return data;
  } else {
    return snap.data() as AppUser;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      setUser(fu);
      if (fu) {
        try {
          const docData = await ensureUserDoc(fu);
          // fetch latest Firestore version for appUser
          const snap = await getDoc(doc(db, "users", fu.uid));
          if (snap.exists()) {
            const d = snap.data() as any;
            setAppUser({
              uid: fu.uid,
              email: fu.email,
              displayName: d.displayName || fu.displayName,
              photoURL: d.photoURL || fu.photoURL,
              username: d.username,
              bio: d.bio,
              bannerUrl: d.bannerUrl,
              level: d.level ?? 1,
              xp: d.xp ?? 0,
              badges: d.badges ?? [],
              createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString(),
            });
          } else setAppUser(docData);
        } catch (e) {
          console.error(e);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    await ensureUserDoc({ ...cred.user, displayName } as FirebaseUser);
  };
  const signInGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(res.user);
  };
  const logout = async () => {
    await signOut(auth);
  };
  const updateAppUser = async (patch: Partial<AppUser>) => {
    if (!user) throw new Error("Not authenticated");
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { ...patch, updatedAt: serverTimestamp() }, { merge: true });
    setAppUser((prev) => (prev ? { ...prev, ...patch } as AppUser : prev));
    if (patch.displayName || patch.photoURL) {
      await updateProfile(user, { displayName: patch.displayName || user.displayName, photoURL: patch.photoURL || user.photoURL });
    }
  };

  return <Ctx.Provider value={{ user, appUser, loading, signIn, signUp, signInGoogle, logout, updateAppUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
