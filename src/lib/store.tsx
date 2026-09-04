"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import type { WatchStatus, WatchlistEntry, Notification, User, WatchStats } from "./types";
import { calcWatchTime } from "./utils";
import { useAuth } from "./auth";
import { subscribeWatchlist, upsertWatchlist, removeWatchlist, subscribeNotifications } from "./firestore";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const mockUserFallback: User = {
  id: "anon",
  username: "misafir",
  displayName: "Misafir",
  avatarUrl: "https://i.pravatar.cc/300?img=68",
  bannerUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
  bio: "Giriş yap ve anime yolculuğunu başlat",
  level: 1,
  xp: 0,
  badges: [],
  avatarFrame: null,
  createdAt: new Date().toISOString(),
};

type Store = {
  theme: "light" | "dark" | "oled";
  setTheme: (t: "light" | "dark" | "oled") => void;
  user: User;
  watchlist: WatchlistEntry[];
  toggleWatch: (anime: any, format: "TV" | "MOVIE") => Promise<void>;
  updateStatus: (id: number, status: WatchStatus, episode?: number, score?: number) => Promise<void>;
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  stats: WatchStats;
};

const Ctx = createContext<Store | null>(null);

function genStats(list: WatchlistEntry[]): WatchStats {
  const completed = list.filter((l) => l.status === "COMPLETED");
  const watching = list.filter((l) => l.status === "WATCHING").length;
  const movies = completed.filter((l) => l.format === "MOVIE").length;
  const episodes = completed.filter((l) => l.format === "TV").reduce((a, c) => a + (c.currentEpisode || 0), 0);
  const totalEpisodesWatching = list.filter((l) => l.status === "WATCHING").reduce((a, c) => a + (c.currentEpisode || 0), 0);
  const totalEp = episodes + totalEpisodesWatching;
  const { hours, days, minutes } = calcWatchTime(totalEp, 24, movies, 110);
  // derive genre breakdown from watchlist anime genres if available else mock
  const genreCount: Record<string, number> = {};
  list.forEach((e) => {
    const g = e.anime?.genres?.[0]?.name || "Action";
    genreCount[g] = (genreCount[g] || 0) + 1;
  });
  if (Object.keys(genreCount).length === 0) {
    genreCount["Action"] = 32;
    genreCount["Fantasy"] = 24;
    genreCount["Drama"] = 18;
    genreCount["Sci-Fi"] = 14;
    genreCount["Comedy"] = 12;
  }
  const total = Object.values(genreCount).reduce((a, b) => a + b, 0);
  const colorMap: Record<string, string> = { Action: "#FF6B9D", Fantasy: "#6BCB77", Drama: "#9C27B0", "Sci-Fi": "#00D9FF", Comedy: "#FFD93D", Adventure: "#00D9FF", Romance: "#E91E63" };
  const breakdown = Object.entries(genreCount).map(([g, c]) => ({
    genre: g,
    count: c as number,
    percentage: Math.round(((c as number) / total) * 100),
    color: colorMap[g] || "#6750A4",
  }));
  return {
    totalCompleted: completed.length,
    totalMoviesCompleted: movies,
    currentlyWatching: watching,
    totalEpisodesWatched: totalEp,
    totalMinutes: minutes,
    totalHours: hours,
    totalDays: days,
    genreBreakdown: breakdown,
    yearlyActivity: [
      { month: "Oca", count: 12 },
      { month: "Şub", count: 19 },
      { month: "Mar", count: 8 },
      { month: "Nis", count: 15 },
      { month: "May", count: 22 },
      { month: "Haz", count: 17 },
    ],
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user: fbUser, appUser } = useAuth();
  const [theme, setThemeState] = useState<"light" | "dark" | "oled">("dark");
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "n1", userId: "sys", type: "TRAILER", title: "Hoş geldin! Demon Slayer Infinity Castle fragmanı yayında", body: "Yeni fragmanı keşfet", isRead: false, createdAt: new Date().toISOString(), link: "/movie/129" },
  ]);

  // theme
  useEffect(() => {
    const s = localStorage.getItem("ap-theme") as any;
    if (s) setThemeState(s);
  }, []);
  useEffect(() => {
    localStorage.setItem("ap-theme", theme);
    document.documentElement.classList.toggle("dark", theme !== "light");
    if (theme === "oled") document.documentElement.classList.add("oled");
    else document.documentElement.classList.remove("oled");
  }, [theme]);

  // watchlist sync: Firestore if logged in, else localStorage
  useEffect(() => {
    if (fbUser) {
      const unsub = subscribeWatchlist(fbUser.uid, (items) => {
        const mapped: WatchlistEntry[] = items.map((d: any) => ({
          id: d.id,
          userId: fbUser.uid,
          tmdbId: d.tmdbId,
          format: d.format,
          status: d.status,
          currentEpisode: d.currentEpisode ?? 0,
          totalEpisodes: d.totalEpisodes,
          score: d.score ?? null,
          progress: d.progress ?? 0,
          isFavorite: d.isFavorite ?? false,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString(),
          anime: d.anime,
        }));
        setWatchlist(mapped);
      });
      return () => unsub();
    } else {
      // load local
      const w = localStorage.getItem("ap-watchlist");
      if (w) try { setWatchlist(JSON.parse(w)); } catch {}
      else setWatchlist([]);
    }
  }, [fbUser]);

  // persist local when anon
  useEffect(() => {
    if (!fbUser) localStorage.setItem("ap-watchlist", JSON.stringify(watchlist));
  }, [watchlist, fbUser]);

  // notifications from Firestore
  useEffect(() => {
    if (!fbUser) return;
    const unsub = subscribeNotifications(fbUser.uid, (items) => {
      if (items.length) setNotifications(items);
    });
    return () => unsub();
  }, [fbUser]);

  const setTheme = (t: "light" | "dark" | "oled") => setThemeState(t);

  const toggleWatch = async (anime: any, format: "TV" | "MOVIE") => {
    if (!fbUser) {
      // anon: local only, but prompt to login
      // still allow local toggle
      const exists = watchlist.find((p) => p.tmdbId === anime.id);
      if (exists) {
        setWatchlist((prev) => prev.filter((p) => p.tmdbId !== anime.id));
      } else {
        const entry: WatchlistEntry = {
          id: String(Date.now()),
          userId: "anon",
          tmdbId: anime.id,
          format,
          status: "PLAN_TO_WATCH",
          currentEpisode: 0,
          totalEpisodes: anime.number_of_episodes || 24,
          score: null,
          progress: 0,
          isFavorite: false,
          updatedAt: new Date().toISOString(),
          anime: {
            tmdbId: anime.id,
            format,
            title: { romaji: anime.original_name || anime.original_title || anime.name || anime.title, english: anime.name || anime.title, native: anime.original_name || anime.original_title },
            overview: anime.overview || "",
            posterPath: anime.poster_path,
            backdropPath: anime.backdrop_path,
            voteAverage: anime.vote_average,
            voteCount: anime.vote_count,
            releaseDate: anime.release_date || null,
            firstAirDate: anime.first_air_date || null,
            lastAirDate: null,
            status: "Finished",
            genres: anime.genres || [],
            studios: [],
            ageRating: "PG-13",
            originalLanguage: "ja",
            popularity: anime.popularity || 0,
          },
        };
        setWatchlist((prev) => [entry, ...prev]);
      }
      // hint to login
      if (!exists) setTimeout(() => alert("Listeye eklendi (misafir modu). Kalıcı kaydetmek için giriş yap!"), 300);
      return;
    }
    const exists = watchlist.find((p) => p.tmdbId === anime.id);
    if (exists) {
      await removeWatchlist(fbUser.uid, anime.id);
    } else {
      await upsertWatchlist(fbUser.uid, anime.id, {
        format,
        status: "PLAN_TO_WATCH",
        currentEpisode: 0,
        totalEpisodes: anime.number_of_episodes || 24,
        score: null,
        progress: 0,
        isFavorite: false,
        anime: {
          tmdbId: anime.id,
          format,
          title: { romaji: anime.original_name || anime.original_title || anime.name || anime.title, english: anime.name || anime.title, native: anime.original_name || anime.original_title },
          overview: anime.overview || "",
          posterPath: anime.poster_path,
          backdropPath: anime.backdrop_path,
          voteAverage: anime.vote_average,
          voteCount: anime.vote_count,
          releaseDate: anime.release_date || null,
          firstAirDate: anime.first_air_date || null,
          lastAirDate: null,
          status: "Finished",
          genres: anime.genres || [],
          studios: [],
          ageRating: "PG-13",
          originalLanguage: "ja",
          popularity: anime.popularity || 0,
        },
      });
    }
  };

  const updateStatus = async (id: number, status: WatchStatus, episode?: number, score?: number) => {
    if (!fbUser) {
      setWatchlist((prev) => prev.map((e) => (e.tmdbId === id ? { ...e, status, currentEpisode: episode ?? e.currentEpisode, score: score ?? e.score, progress: status === "COMPLETED" ? 100 : e.progress, updatedAt: new Date().toISOString() } : e)));
      return;
    }
    const current = watchlist.find((w) => w.tmdbId === id);
    const patch: any = { status, updatedAt: serverTimestamp() };
    if (episode !== undefined) patch.currentEpisode = episode;
    if (score !== undefined) patch.score = score;
    if (status === "COMPLETED") patch.progress = 100;
    await upsertWatchlist(fbUser.uid, id, { ...current, ...patch, status });
    // also update xp/level
    if (status === "COMPLETED") {
      try {
        await setDoc(doc(db, "users", fbUser.uid), { xp: (appUser?.xp || 0) + 100 }, { merge: true });
      } catch {}
    }
  };

  const markRead = (id: string) => setNotifications((n) => n.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
  const markAllRead = () => setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));

  // stats
  const stats = genStats(watchlist.length ? watchlist : []);

  // if empty, show demo-ish but real: if no watchlist, don't fake 247 – show 0 but keep genre chart placeholder
  const displayStats: WatchStats = watchlist.length === 0 ? { ...stats, totalCompleted: 0, totalMoviesCompleted: 0, currentlyWatching: 0, totalEpisodesWatched: 0, totalMinutes: 0, totalHours: 0, totalDays: 0 } : stats;

  // user mapping
  const user: User = appUser
    ? {
        id: appUser.uid,
        username: appUser.username,
        displayName: appUser.displayName || "Otaku",
        avatarUrl: appUser.photoURL || mockUserFallback.avatarUrl,
        bannerUrl: appUser.bannerUrl,
        bio: appUser.bio,
        level: appUser.level ?? 1,
        xp: appUser.xp ?? 0,
        badges: appUser.badges ?? [],
        avatarFrame: null,
        createdAt: appUser.createdAt,
        isVerified: true,
      }
    : mockUserFallback;

  return <Ctx.Provider value={{ theme, setTheme, user, watchlist, toggleWatch, updateStatus, notifications, markRead, markAllRead, stats: displayStats }}>{children}</Ctx.Provider>;
}
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
};
