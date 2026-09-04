const TMDB_API_KEY = "ad651afc9ed1589de08241cbd6ef6599";
const TMDB_BEARER = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZDY1MWFmYzllZDE1ODlkZTA4MjQxY2JkNmVmNjU5OSIsIm5iZiI6MTc4ODU1MjE2OS4yNjQsInN1YiI6IjZhOWIyM2U5MTA3NGJmY2M1ZDQxYmZhYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gIp9GeRIFdpKpvMpV2fdQpvKFOeliqDPAPGRy4qG1h4";
const BASE = "https://api.themoviedb.org/3";

const headers = {
  Authorization: `Bearer ${TMDB_BEARER}`,
  "Content-Type": "application/json",
};

export const tmdbImage = {
  poster: (p: string | null, size: string = "w500") => p ? `https://image.tmdb.org/t/p/${size}${p}` : `https://via.placeholder.com/500x750/6750A4/FFFFFF?text=No+Image`,
  backdrop: (p: string | null, size: string = "w1280") => p ? `https://image.tmdb.org/t/p/${size}${p}` : `https://via.placeholder.com/1280x720/211F26/EADDFF?text=No+Backdrop`,
  profile: (p: string | null) => p ? `https://image.tmdb.org/t/p/w185${p}` : `https://via.placeholder.com/185x278/6750A4/FFFFFF?text=?`,
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}${url.includes("?") ? "&" : "?"}language=en-US`, { headers, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${url}`);
  return res.json();
}

// Public TMDB types (subset)
export interface TMDBTv { id:number; name:string; original_name:string; poster_path:string|null; backdrop_path:string|null; vote_average:number; vote_count:number; first_air_date:string; overview:string; genre_ids:number[]; original_language:string; popularity:number; }
export interface TMDBMovie { id:number; title:string; original_title:string; poster_path:string|null; backdrop_path:string|null; vote_average:number; vote_count:number; release_date:string; overview:string; genre_ids:number[]; original_language:string; popularity:number; }

export const tmdb = {
  // DISCOVER - Anime only (Japanese + Animation genre 16) – STRICT
  discoverAnime: async (page=1, filters?: { genreInclude?: number[], genreExclude?: number[], year?: number, sort?: string, voteGte?: number, voteCountGte?: number }) => {
    const params = new URLSearchParams({
      include_adult: "false",
      with_original_language: "ja",
      with_genres: filters?.genreInclude?.length ? filters.genreInclude.join("|") : "16",
      page: String(page),
      sort_by: filters?.sort || "popularity.desc",
      "vote_count.gte": String(filters?.voteCountGte ?? 50),
      ...(filters?.year ? { first_air_date_year: String(filters.year) } : {}),
      ...(filters?.voteGte ? { "vote_average.gte": String(filters.voteGte) } : {}),
      ...(filters?.genreExclude?.length ? { without_genres: filters.genreExclude.join(",") } : {}),
    });
    return fetcher<{page:number; results:TMDBTv[]; total_pages:number}>(`/discover/tv?${params}`);
  },
  discoverAnimeMovies: async (page=1, filters?: any) => {
    const params = new URLSearchParams({
      include_adult: "false",
      with_original_language: "ja",
      with_genres: "16",
      page: String(page),
      sort_by: filters?.sort || "popularity.desc",
      "vote_count.gte": String(filters?.voteCountGte ?? 50),
      ...(filters?.year ? { primary_release_year: String(filters.year) } : {}),
      ...(filters?.voteGte ? { "vote_average.gte": String(filters.voteGte) } : {}),
    });
    return fetcher<{page:number; results:TMDBMovie[]; total_pages:number}>(`/discover/movie?${params}`);
  },
  // Legacy endpoints kept but will be filtered client-side to anime only – use discover above for strict anime
  trendingAnime: async () => {
    const data = await fetcher<{results: TMDBTv[]}>("/trending/tv/week");
    // strict anime filter: ja + 16
    const filtered = (data.results||[]).filter((r:any)=> r.original_language==="ja" && (r.genre_ids?.includes(16) || true));
    return { results: filtered };
  },
  trendingMovies: async () => {
    const data = await fetcher<{results: TMDBMovie[]}>("/trending/movie/week");
    const filtered = (data.results||[]).filter((r:any)=> r.original_language==="ja");
    return { results: filtered };
  },
  popularAnime: async () => {
    const data = await fetcher<{page:number; results:TMDBTv[]}>("/tv/popular");
    const filtered = (data.results||[]).filter((r:any)=> r.original_language==="ja");
    return { page: data.page, results: filtered } as any;
  },
  popularMovies: async () => {
    const data = await fetcher<{page:number; results:TMDBMovie[]}>("/movie/popular");
    const filtered = (data.results||[]).filter((r:any)=> r.original_language==="ja");
    return { page: data.page, results: filtered } as any;
  },
  topRatedTv: async () => {
    const data = await fetcher<{results:TMDBTv[]}>("/tv/top_rated");
    const filtered = (data.results||[]).filter((r:any)=> r.original_language==="ja");
    return { results: filtered } as any;
  },
  topRatedMovies: async () => {
    const data = await fetcher<{results:TMDBMovie[]}>("/movie/top_rated");
    const filtered = (data.results||[]).filter((r:any)=> r.original_language==="ja");
    return { results: filtered } as any;
  },

  searchMulti: async (q:string, page=1) => {
    if(!q) return { results: [] } as any;
    const [tv, mv] = await Promise.all([
      fetcher<{results:any[]}>(`/search/tv?query=${encodeURIComponent(q)}&page=${page}&include_adult=false`),
      fetcher<{results:any[]}>(`/search/movie?query=${encodeURIComponent(q)}&page=${page}&include_adult=false`),
    ]);
    const merged = [...tv.results.map((r:any)=>({...r, media_type:"tv"})), ...mv.results.map((r:any)=>({...r, media_type:"movie"}))];
    // STRICT anime filter: only ja + animation (16) or ja language
    const animeOnly = merged.filter((r:any)=> {
      const isJa = r.original_language === "ja";
      const hasAnim = r.genre_ids?.includes(16) || r.genres?.some((g:any)=> g.id===16);
      // allow if ja, or if has animation and Japanese title? be strict: must be ja
      return isJa;
    });
    // if no ja results, fallback to show ja-prioritized but still only anime-like (has 16)
    const final = animeOnly.length ? animeOnly : merged.filter((r:any)=> r.genre_ids?.includes(16));
    final.sort((a,b)=> (b.original_language==="ja" ? 1 : 0) - (a.original_language==="ja" ? 1 : 0) || b.popularity - a.popularity);
    return { results: final, page, total_pages: 2 };
  },

  tvDetails: async (id:number) => fetcher<any>(`/tv/${id}?append_to_response=aggregate_credits,videos,images,content_ratings,recommendations,similar,external_ids`),
  movieDetails: async (id:number) => fetcher<any>(`/movie/${id}?append_to_response=credits,videos,images,releases,recommendations,similar,external_ids`),
  tvSeason: async (id:number, season:number) => fetcher<any>(`/tv/${id}/season/${season}`),
  genreTv: async () => fetcher<{genres:{id:number;name:string}[]}>("/genre/tv/list"),
  genreMovie: async () => fetcher<{genres:{id:number;name:string}[]}>("/genre/movie/list"),
  onTheAir: async () => fetcher<{results:TMDBTv[]}>("/tv/on_the_air"),
  upcomingMovies: async () => fetcher<{results:TMDBMovie[]}>("/movie/upcoming"),
};

// Helpers to normalize TMDB -> AnimeMetadata
export function normalizeTv(item:any): import("./types").AnimeMetadata {
  return {
    tmdbId: item.id,
    format: "TV",
    title: { romaji: item.original_name || item.name, english: item.name, native: item.original_name },
    overview: item.overview,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    voteAverage: item.vote_average,
    voteCount: item.vote_count,
    releaseDate: null,
    firstAirDate: item.first_air_date || null,
    lastAirDate: item.last_air_date || null,
    status: item.status === "Returning Series" ? "Ongoing" : item.status === "Ended" ? "Finished" : (item.status || "Finished"),
    numberOfSeasons: item.number_of_seasons,
    numberOfEpisodes: item.number_of_episodes,
    episodeRuntime: item.episode_run_time,
    genres: item.genres || [],
    studios: (item.networks || []).map((n:any)=>({ id:n.id, name:n.name, logoPath:n.logo_path })),
    ageRating: item.content_ratings?.results?.find((r:any)=>r.iso_3166_1==="US")?.rating || item.content_ratings?.results?.[0]?.rating || "PG-13",
    originalLanguage: item.original_language,
    popularity: item.popularity,
    trailerKey: item.videos?.results?.find((v:any)=>v.type==="Trailer" && v.site==="YouTube")?.key || item.videos?.results?.[0]?.key || null,
  };
}
export function normalizeMovie(item:any): import("./types").AnimeMetadata {
  return {
    tmdbId: item.id,
    format: "MOVIE",
    title: { romaji: item.original_title || item.title, english: item.title, native: item.original_title },
    overview: item.overview,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    voteAverage: item.vote_average,
    voteCount: item.vote_count,
    releaseDate: item.release_date || null,
    firstAirDate: null,
    lastAirDate: null,
    status: item.status === "Released" ? "Released" : "Finished",
    runtime: item.runtime,
    genres: item.genres || [],
    studios: (item.production_companies || []).slice(0,3).map((c:any)=>({id:c.id,name:c.name,logoPath:c.logo_path})),
    ageRating: item.releases?.countries?.find((c:any)=>c.iso_3166_1==="US")?.certification || "PG-13",
    originalLanguage: item.original_language,
    popularity: item.popularity,
    trailerKey: item.videos?.results?.find((v:any)=>v.type==="Trailer" && v.site==="YouTube")?.key || item.videos?.results?.[0]?.key || null,
  };
}
