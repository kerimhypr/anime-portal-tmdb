// Production-ready TypeScript interfaces for PostgreSQL/Supabase

export type AnimeFormat = "TV" | "MOVIE" | "OVA" | "SPECIAL";
export type WatchStatus = "WATCHING" | "COMPLETED" | "ON_HOLD" | "DROPPED" | "PLAN_TO_WATCH";
export type SeasonName = "WINTER" | "SPRING" | "SUMMER" | "FALL";
export type ForumTag = "GENERAL" | "SPOILERS" | "RECOMMENDATIONS" | "NEWS" | "THEORY" | "EPISODE";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  level: number;
  xp: number;
  badges: Badge[];
  avatarFrame: string | null;
  createdAt: string;
  isVerified?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  earnedAt: string;
}

export interface AnimeMetadata {
  tmdbId: number;
  format: AnimeFormat;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  releaseDate: string | null; // for movies
  firstAirDate: string | null; // for TV
  lastAirDate: string | null;
  status: "Ongoing" | "Finished" | "Upcoming" | "Cancelled" | "Released";
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  runtime?: number; // minutes for movies
  episodeRuntime?: number[]; // for TV
  genres: Genre[];
  studios: Studio[];
  ageRating: string | null;
  originalLanguage: string;
  popularity: number;
  trailerKey?: string | null;
}

export interface Genre { id: number; name: string; }
export interface Studio { id: number; name: string; logoPath: string | null; }
export interface Episode {
  id: number;
  name: string;
  overview: string;
  episodeNumber: number;
  seasonNumber: number;
  airDate: string | null;
  runtime: number | null;
  stillPath: string | null;
  voteAverage: number;
}

export interface Season {
  id: number;
  name: string;
  seasonNumber: number;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
  episodes?: Episode[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
  role: "MAIN" | "SUPPORTING";
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: "YouTube" | "Vimeo";
  type: "Trailer" | "Teaser" | "Clip" | "Featurette" | "Opening" | string;
  official: boolean;
  publishedAt: string;
}

export interface RelationNode {
  id: number;
  title: string;
  posterPath: string | null;
  type: "SEQUEL" | "PREQUEL" | "SPIN_OFF" | "SIDE_STORY" | "MOVIE" | "RELATED";
  year: string | null;
  voteAverage: number;
}

export interface WatchlistEntry {
  id: string;
  userId: string;
  tmdbId: number;
  format: AnimeFormat;
  status: WatchStatus;
  currentEpisode: number;
  totalEpisodes?: number;
  score: number | null; // 1-10
  progress: number; // 0-100
  isFavorite: boolean;
  updatedAt: string;
  anime: AnimeMetadata;
}

export interface WatchStats {
  totalCompleted: number;
  totalMoviesCompleted: number;
  currentlyWatching: number;
  totalEpisodesWatched: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  genreBreakdown: { genre: string; count: number; percentage: number; color: string }[];
  yearlyActivity: { month: string; count: number }[];
}

export interface Watchlist {
  id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  coverUrl: string | null;
  animeIds: number[];
  createdAt: string;
  likes: number;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: User;
  tag: ForumTag;
  animeId?: number;
  likes: number;
  replies: number;
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt: string;
  views: number;
}

export interface Comment {
  id: string;
  animeId: number;
  parentId: string | null;
  author: User;
  content: string;
  isSpoiler: boolean;
  gifUrl?: string;
  upvotes: number;
  downvotes: number;
  userVote: "UP" | "DOWN" | null;
  replies?: Comment[];
  createdAt: string;
  badges?: string[];
}

export interface Review {
  id: string;
  animeId: number;
  author: User;
  rating: number; // 1-10
  title: string;
  content: string;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  isSpoiler: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: "REPLY" | "MENTION" | "TRAILER" | "NEW_SEASON" | "WALL_COMMENT" | "SYSTEM";
  title: string;
  body: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface BroadcastItem {
  animeId: number;
  title: string;
  posterPath: string | null;
  episodeNumber: number;
  airTime: string; // ISO
  dayOfWeek: number; // 0-6
  isMovie?: boolean;
}
