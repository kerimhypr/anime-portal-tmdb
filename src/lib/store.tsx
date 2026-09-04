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

const TMDB_GENRE_MAP: Record<number,string> = {28:"Action",12:"Adventure",16:"Animation",35:"Comedy",18:"Drama",14:"Fantasy",27:"Horror",10749:"Romance",878:"Sci-Fi",53:"Thriller",10765:"Sci-Fi & Fantasy",9648:"Mystery",10751:"Family",10759:"Action & Adventure",10762:"Kids",10763:"News",10764:"Reality",10767:"Talk",80:"Crime",99:"Documentary",36:"History",10402:"Music",10768:"War & Politics",37:"Western"};
function isWatched(e: WatchlistEntry): boolean {
  if (e.format === "MOVIE") return e.status === "COMPLETED" || e.status === "WATCHING";
  return (e.currentEpisode || 0) >= 1;
}
function genStats(list: WatchlistEntry[]): WatchStats {
  const watched = list.filter(isWatched);
  const completed = watched.filter((l) => l.status === "COMPLETED");
  const watching = watched.filter((l) => l.status === "WATCHING").length;
  const movies = completed.filter((l) => l.format === "MOVIE").length;
  const episodes = completed.filter((l) => l.format === "TV").reduce((a, c) => a + (c.currentEpisode || 0), 0);
  const totalEpisodesWatching = watched.filter((l) => l.status === "WATCHING").reduce((a, c) => a + (c.currentEpisode || 0), 0);
  const totalEp = episodes + totalEpisodesWatching;
  const { hours, days, minutes } = calcWatchTime(totalEp, 24, movies, 110);
  // genre breakdown – only for watched (>=1 episode), skip Bilinmeyen if no genre info
  const genreCount: Record<string, number> = {};
  watched.forEach((e) => {
    const genres: any[] = e.anime?.genres || [];
    const genreIds: number[] = (e.anime as any)?.genre_ids || [];
    if (genres && genres.length) {
      genres.forEach((g: any) => {
        const name = g.name;
        if(name && name!=="Bilinmeyen"){ genreCount[name] = (genreCount[name] || 0) + 1; }
      });
    } else if (genreIds.length) {
      genreIds.forEach((id:number)=>{
        const name = TMDB_GENRE_MAP[id];
        if(name) genreCount[name] = (genreCount[name] || 0) + 1;
      });
    }
    // if still no genre, skip – don't count as Bilinmeyen
  });
  const total = Object.values(genreCount).reduce((a, b) => a + b, 0);
  const colorMap: Record<string, string> = { "Action": "#FF6B9D", "Action & Adventure": "#FF6B9D", "Adventure": "#00D9FF", "Animation": "#6750A4", "Comedy": "#FFD93D", "Drama": "#9C27B0", "Fantasy": "#6BCB77", "Sci-Fi": "#00D9FF", "Sci-Fi & Fantasy": "#00D9FF", "Romance": "#E91E63", "Science Fiction": "#00D9FF", "Mystery": "#607D8B", "Horror": "#795548", "Thriller": "#FF5722", "Family": "#8BC34A" };
  const breakdown = Object.entries(genreCount).map(([g, c]) => ({
    genre: g,
    count: c as number,
    percentage: total ? Math.round(((c as number) / total) * 100) : 0,
    color: colorMap[g] || "#6750A4",
  }));

  // yearly activity: only watched
  const monthNames = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  const monthCounts: Record<string, number> = {};
  monthNames.forEach((m) => (monthCounts[m] = 0));
  let hasRealDates = false;
  watched.forEach((e) => {
    try {
      const d = new Date(e.updatedAt);
      if (!isNaN(d.getTime())) {
        const idx = d.getMonth();
        monthCounts[monthNames[idx]]++;
        hasRealDates = true;
      }
    } catch {}
  });
  const yearlyActivity = hasRealDates
    ? monthNames.map((m) => ({ month: m, count: monthCounts[m] })).filter((x) => x.count > 0)
    : [];

  return {
    totalCompleted: completed.length,
    totalMoviesCompleted: movies,
    currentlyWatching: watching,
    totalEpisodesWatched: totalEp,
    totalMinutes: minutes,
    totalHours: hours,
    totalDays: days,
    genreBreakdown: breakdown,
    yearlyActivity,
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

  const toGenres = (anime:any): any[] => {
    if (anime.genres && anime.genres.length) return anime.genres;
    if (anime.genre_ids && anime.genre_ids.length) return anime.genre_ids.map((id:number)=> ({ id, name: TMDB_GENRE_MAP[id] || String(id) })).filter((g:any)=> g.name);
    return [];
  };
  const toggleWatch = async (anime: any, format: "TV" | "MOVIE") => {
    if (!fbUser) {
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
          totalEpisodes: anime.number_of_episodes || anime.number_of_episodes === 0 ? anime.number_of_episodes : (anime.number_of_episodes || 24),
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
            genres: toGenres(anime),
            studios: [],
            ageRating: "PG-13",
            originalLanguage: "ja",
            popularity: anime.popularity || 0,
          } as any,
        };
        (entry.anime as any).genre_ids = anime.genre_ids || [];
        setWatchlist((prev) => [entry, ...prev]);
      }
      if (!exists) setTimeout(() => alert("Listeye eklendi (misafir modu). Kalıcı kaydetmek için giriş yap!"), 300);
      return;
    }
    const exists = watchlist.find((p) => p.tmdbId === anime.id);
    if (exists) {
      await removeWatchlist(fbUser.uid, anime.id);
    } else {
      const genres = toGenres(anime);
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
          genres,
          genre_ids: anime.genre_ids || [],
          studios: [],
          ageRating: "PG-13",
          originalLanguage: "ja",
          popularity: anime.popularity || 0,
        },
      });
    }
  };

  const updateStatus = async (id: number, status: WatchStatus, episode?: number, score?: number) => {
    // clamp episode to valid range
    const currentForClamp = watchlist.find((w) => w.tmdbId === id);
    const maxEp = currentForClamp?.totalEpisodes || currentForClamp?.anime?.numberOfEpisodes || 24;
    let clampedEp = episode;
    if (clampedEp !== undefined) {
      clampedEp = Math.max(0, Math.min(maxEp, clampedEp));
      // auto complete if reached max
      if (clampedEp >= maxEp && status === "WATCHING") status = "COMPLETED";
    }
    if (!fbUser) {
      setWatchlist((prev) => prev.map((e) => {
        if (e.tmdbId !== id) return e;
        const me = Math.max(0, Math.min(e.totalEpisodes || 24, clampedEp ?? e.currentEpisode));
        return { ...e, status, currentEpisode: me, score: score ?? e.score, progress: status === "COMPLETED" ? 100 : Math.round((me / (e.totalEpisodes || 24)) * 100), updatedAt: new Date().toISOString() };
      }));
      return;
    }
    const current = currentForClamp;
    const patch: any = { status, updatedAt: serverTimestamp() };
    if (clampedEp !== undefined) patch.currentEpisode = clampedEp;
    if (score !== undefined) patch.score = score;
    if (status === "COMPLETED") patch.progress = 100;
    else if (clampedEp !== undefined) patch.progress = Math.round((clampedEp / maxEp) * 100);
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

  // stats – fully real, no dummy fallback
  const stats = genStats(watchlist);

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

  return <Ctx.Provider value={{ theme, setTheme, user, watchlist, toggleWatch, updateStatus, notifications, markRead, markAllRead, stats }}>{children}</Ctx.Provider>;
}
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
};
