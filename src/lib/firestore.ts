import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  updateDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Watchlist ──
export type WatchStatus = "WATCHING" | "COMPLETED" | "ON_HOLD" | "DROPPED" | "PLAN_TO_WATCH";
export function watchlistCol(uid: string) {
  return collection(db, "users", uid, "watchlist");
}
export async function upsertWatchlist(uid: string, tmdbId: number, data: any) {
  const ref = doc(db, "users", uid, "watchlist", String(tmdbId));
  await setDoc(ref, { ...data, tmdbId, updatedAt: serverTimestamp() }, { merge: true });
}
export async function removeWatchlist(uid: string, tmdbId: number) {
  await deleteDoc(doc(db, "users", uid, "watchlist", String(tmdbId)));
}
export function subscribeWatchlist(uid: string, cb: (items: any[]) => void) {
  return onSnapshot(query(watchlistCol(uid), orderBy("updatedAt", "desc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ── Comments ──
export async function addComment(animeId: number, author: any, content: string, isSpoiler: boolean, gifUrl?: string, parentId: string | null = null) {
  const col = collection(db, "comments");
  const docRef = await addDoc(col, {
    animeId,
    parentId,
    author: {
      uid: author.uid,
      displayName: author.displayName,
      username: author.username,
      photoURL: author.photoURL,
      level: author.level || 1,
    },
    content,
    isSpoiler,
    gifUrl: gifUrl || null,
    upvotes: 0,
    downvotes: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
export function subscribeComments(animeId: number, cb: (items: any[]) => void) {
  // avoid composite index: fetch by animeId and sort client-side
  const q = query(collection(db, "comments"), where("animeId", "==", animeId), limit(100));
  return onSnapshot(q, (snap) => {
    const docs: any[] = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: (d.data().createdAt?.toDate?.() || new Date()).toISOString(), _ts: d.data().createdAt?.toDate?.()?.getTime() || 0 })).sort((a:any,b:any)=> b._ts - a._ts);
    // build tree
    const map = new Map<string, any>();
    docs.forEach((d) => map.set(d.id, { ...d, replies: [] }));
    const roots: any[] = [];
    docs.forEach((d) => {
      if (d.parentId && map.has(d.parentId)) map.get(d.parentId).replies.push(map.get(d.id));
      else roots.push(map.get(d.id));
    });
    cb(roots);
  });
}
export async function voteComment(commentId: string, deltaUp: number, deltaDown: number) {
  const ref = doc(db, "comments", commentId);
  await updateDoc(ref, { upvotes: increment(deltaUp), downvotes: increment(deltaDown) });
}

// ── Forum ──
export async function createThread(author: any, title: string, content: string, tag: string, animeId?: number) {
  const col = collection(db, "forumThreads");
  const ref = await addDoc(col, {
    title,
    content,
    tag,
    animeId: animeId || null,
    author: {
      uid: author.uid,
      displayName: author.displayName,
      username: author.username,
      photoURL: author.photoURL,
    },
    likes: 0,
    likedBy: [],
    replies: 0,
    views: 0,
    isPinned: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
export function subscribeThreads(cb: (items: any[]) => void) {
  return onSnapshot(query(collection(db, "forumThreads"), orderBy("createdAt", "desc"), limit(50)), (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt?.toDate?.() || new Date()).toISOString(),
        created: new Date(d.data().createdAt?.toDate?.() || Date.now()).toLocaleString("tr-TR"),
      }))
    );
  });
}
export async function replyThread(threadId: string, author: any, content: string, parentId: string | null = null) {
  const col = collection(db, "forumThreads", threadId, "replies");
  await addDoc(col, {
    author: { uid: author.uid, displayName: author.displayName, username: author.username, photoURL: author.photoURL },
    content,
    parentId: parentId || null,
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: [],
  });
  await updateDoc(doc(db, "forumThreads", threadId), { replies: increment(1) });
}
export async function likeReply(threadId: string, replyId: string, uid: string) {
  const ref = doc(db, "forumThreads", threadId, "replies", replyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Yanıt bulunamadı");
  const data = snap.data() as any;
  const already = (data.likedBy || []).includes(uid);
  await updateDoc(ref, {
    likes: increment(already ? -1 : 1),
    likedBy: already ? arrayRemove(uid) : arrayUnion(uid),
  });
  return !already;
}
export function subscribeReplies(threadId: string, cb: (items: any[]) => void) {
  return onSnapshot(query(collection(db, "forumThreads", threadId, "replies"), orderBy("createdAt", "asc"), limit(100)), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: (d.data().createdAt?.toDate?.() || new Date()).toISOString() })));
  });
}
export async function likeThread(threadId: string, uid: string) {
  const ref = doc(db, "forumThreads", threadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Konu bulunamadı");
  const data = snap.data() as any;
  const already = (data.likedBy || []).includes(uid);
  await updateDoc(ref, {
    likes: increment(already ? -1 : 1),
    likedBy: already ? arrayRemove(uid) : arrayUnion(uid),
  });
  return !already;
}
export async function getThread(threadId: string) {
  const snap = await getDoc(doc(db, "forumThreads", threadId));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return { id: snap.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(), created: new Date(data.createdAt?.toDate?.() || Date.now()).toLocaleString("tr-TR") };
}

// ── Shoutbox ──
export async function sendShout(author: any, text: string) {
  await addDoc(collection(db, "shoutbox"), {
    uid: author.uid,
    user: author.username || author.displayName,
    displayName: author.displayName,
    avatar: author.photoURL,
    text,
    createdAt: serverTimestamp(),
  });
}
export function subscribeShoutbox(cb: (items: any[]) => void) {
  return onSnapshot(query(collection(db, "shoutbox"), orderBy("createdAt", "desc"), limit(50)), (snap) => {
    const items = snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        time: (d.data().createdAt?.toDate?.() || new Date()).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      }))
      .reverse();
    cb(items);
  });
}

// ── Reviews ──
export async function addReview(animeId: number, author: any, rating: number, title: string, content: string, isSpoiler: boolean) {
  await addDoc(collection(db, "reviews"), {
    animeId,
    author: { uid: author.uid, displayName: author.displayName, username: author.username, photoURL: author.photoURL },
    rating,
    title,
    content,
    isSpoiler,
    helpful: 0,
    notHelpful: 0,
    createdAt: serverTimestamp(),
  });
  // also give XP
  try {
    await updateDoc(doc(db, "users", author.uid), { xp: increment(50) });
  } catch {}
}
export function subscribeReviews(animeId: number, cb: (items: any[]) => void) {
  return onSnapshot(query(collection(db, "reviews"), where("animeId", "==", animeId), limit(20)), (snap) => {
    const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt?.toDate?.() || new Date()).toISOString(),
        _ts: d.data().createdAt?.toDate?.()?.getTime() || 0,
      })).sort((a,b)=> b._ts - a._ts);
    // strip _ts
    cb(items.map(({_ts, ...rest})=> rest));
  });
}
export async function voteReview(reviewId: string, helpful: boolean) {
  await updateDoc(doc(db, "reviews", reviewId), { [helpful ? "helpful" : "notHelpful"]: increment(1) });
}

// ── Requests ──
export async function createRequest(uid: string | null, name: string, link: string, details: string) {
  await addDoc(collection(db, "requests"), {
    uid: uid || "anon",
    name,
    link,
    details,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// ── Notifications ── (simplified: global per user)
export function subscribeNotifications(uid: string, cb: (items: any[]) => void) {
  return onSnapshot(query(collection(db, "notifications"), where("userId", "==", uid), limit(20)), (snap) => {
    const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt?.toDate?.() || new Date()).toISOString(),
        _ts: d.data().createdAt?.toDate?.()?.getTime() || 0,
      })).sort((a,b)=> b._ts - a._ts);
    cb(items.map(({_ts, ...r})=> r));
  });
}

// ── Custom Watchlists (user-created) ──
export async function createCustomList(uid: string, title: string, description: string, isPublic: boolean) {
  const col = collection(db, "customLists");
  const ref = await addDoc(col, {
    userId: uid,
    title,
    description,
    isPublic,
    animeIds: [],
    likes: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
export function subscribeCustomLists(uid: string, cb: (items: any[]) => void) {
  return onSnapshot(query(collection(db, "customLists"), where("userId", "==", uid), limit(20)), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(), _ts: d.data().createdAt?.toDate?.()?.getTime() || 0 })).sort((a:any,b:any)=> b._ts - a._ts);
    cb(items.map(({ _ts, ...r }: any) => r));
  });
}
export function subscribePublicLists(cb: (items: any[]) => void) {
  return onSnapshot(query(collection(db, "customLists"), where("isPublic", "==", true), limit(20)), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), _ts: d.data().createdAt?.toDate?.()?.getTime() || 0 })).sort((a:any,b:any)=> b._ts - a._ts);
    cb(items.map(({ _ts, ...r }: any) => r));
  });
}
export async function deleteCustomList(listId: string) {
  await deleteDoc(doc(db, "customLists", listId));
}
export async function addAnimeToCustomList(listId: string, tmdbId: number) {
  const ref = doc(db, "customLists", listId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Liste bulunamadı");
  const data = snap.data() as any;
  const ids = data.animeIds || [];
  if (ids.includes(tmdbId)) throw new Error("Bu anime zaten listede");
  await updateDoc(ref, { animeIds: [...ids, tmdbId] });
}
