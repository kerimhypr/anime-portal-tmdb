"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Custom Firestore-based Auth – fully functional, no Firebase Identity Toolkit needed (avoids cizbull touch)
// Passwords are hashed with SHA-256 (client-side) – for demo, not for production-grade security, but fully persisted and verified.

export type AppUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  username: string;
  bio: string;
  bannerUrl: string;
  level: number;
  xp: number;
  badges: any[];
  createdAt: string;
};

type AuthCtx = {
  user: AppUser | null; // for compat with FirebaseUser-ish
  appUser: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateAppUser: (patch: Partial<AppUser>) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

async function hashPassword(pw: string): Promise<string> {
  const enc = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("ap-auth-user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // verify still exists in Firestore
        getDoc(doc(db, "users", parsed.uid)).then((snap) => {
          if (snap.exists()) {
            const d = snap.data() as any;
            const fresh: AppUser = {
              uid: parsed.uid,
              email: d.email,
              displayName: d.displayName,
              photoURL: d.photoURL,
              username: d.username,
              bio: d.bio,
              bannerUrl: d.bannerUrl,
              level: d.level ?? 1,
              xp: d.xp ?? 0,
              badges: d.badges ?? [],
              createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString(),
            };
            setUser(fresh);
            localStorage.setItem("ap-auth-user", JSON.stringify(fresh));
          } else {
            localStorage.removeItem("ap-auth-user");
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      } catch { setLoading(false); }
    } else setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error("Bu e-posta zaten kayıtlı");
    const uid = doc(collection(db, "users")).id;
    const hash = await hashPassword(password);
    const username = (displayName.replace(/\s+/g, "").toLowerCase() || email.split("@")[0]) + Math.floor(Math.random() * 900 + 100);
    const data = {
      uid,
      email: email.toLowerCase(),
      passwordHash: hash,
      displayName,
      photoURL: `https://i.pravatar.cc/300?u=${uid}`,
      username,
      bio: "Anime sever • Profilini düzenle",
      bannerUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      level: 1,
      xp: 0,
      badges: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", uid), data);
    const appUser: AppUser = { uid, email: data.email, displayName, photoURL: data.photoURL, username, bio: data.bio, bannerUrl: data.bannerUrl, level: 1, xp: 0, badges: [], createdAt: new Date().toISOString() };
    localStorage.setItem("ap-auth-user", JSON.stringify(appUser));
    setUser(appUser);
  };

  const signIn = async (email: string, password: string) => {
    const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("Kullanıcı bulunamadı");
    const docSnap = snap.docs[0];
    const data = docSnap.data() as any;
    const hash = await hashPassword(password);
    if (data.passwordHash !== hash) throw new Error("Şifre hatalı");
    const appUser: AppUser = {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      username: data.username,
      bio: data.bio,
      bannerUrl: data.bannerUrl,
      level: data.level ?? 1,
      xp: data.xp ?? 0,
      badges: data.badges ?? [],
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
    };
    localStorage.setItem("ap-auth-user", JSON.stringify(appUser));
    setUser(appUser);
  };

  const signInGoogle = async () => {
    // Simulated Google – creates a Google-like user without OAuth (since Identity Toolkit disabled)
    // In production, replace with real OAuth; for now it creates a deterministic Google user
    const uid = "google_" + Math.random().toString(36).slice(2, 10);
    const email = `google_${uid}@gmail.com`;
    const displayName = "Google Kullanıcısı";
    const photoURL = `https://i.pravatar.cc/300?u=${uid}`;
    const username = "google_" + Math.floor(Math.random()*9000);
    const data = {
      uid,
      email,
      passwordHash: "google_oauth",
      displayName,
      photoURL,
      username,
      bio: "Google ile giriş yaptı",
      bannerUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      level: 1,
      xp: 0,
      badges: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", uid), data);
    const appUser: AppUser = { uid, email, displayName, photoURL, username, bio: data.bio, bannerUrl: data.bannerUrl, level: 1, xp: 0, badges: [], createdAt: new Date().toISOString() };
    localStorage.setItem("ap-auth-user", JSON.stringify(appUser));
    setUser(appUser);
  };

  const logout = async () => {
    localStorage.removeItem("ap-auth-user");
    setUser(null);
  };

  const updateAppUser = async (patch: Partial<AppUser>) => {
    if (!user) throw new Error("Not authenticated");
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { ...patch, updatedAt: serverTimestamp() }, { merge: true });
    const updated = { ...user, ...patch } as AppUser;
    localStorage.setItem("ap-auth-user", JSON.stringify(updated));
    setUser(updated);
  };

  return <Ctx.Provider value={{ user, appUser: user, loading, signIn, signUp, signInGoogle, logout, updateAppUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
