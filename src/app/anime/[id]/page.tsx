import AnimeClient from "./AnimeClient";

export async function generateStaticParams() {
  const TMDB_BEARER = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZDY1MWFmYzllZDE1ODlkZTA4MjQxY2JkNmVmNjU5OSIsIm5iZiI6MTc4ODU1MjE2OS4yNjQsInN1YiI6IjZhOWIyM2U5MTA3NGJmY2M1ZDQxYmZhYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gIp9GeRIFdpKpvMpV2fdQpvKFOeliqDPAPGRy4qG1h4";
  try {
    const res = await fetch("https://api.themoviedb.org/3/discover/tv?with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=1&language=en-US", {
      headers: { Authorization: `Bearer ${TMDB_BEARER}` },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const ids = (data.results || []).slice(0, 30).map((r: any) => ({ id: String(r.id) }));
    // ensure some known anime always included
    const extra = ["37854", "94605", "31911", "1429", "46260", "85937", "219860", "95557"];
    extra.forEach((id) => { if (!ids.find((x: any) => x.id === id)) ids.push({ id }); });
    return ids.slice(0, 40);
  } catch {
    return [{ id: "37854" }, { id: "94605" }, { id: "31911" }, { id: "85937" }];
  }
}

export default function Page() {
  return <AnimeClient />;
}
