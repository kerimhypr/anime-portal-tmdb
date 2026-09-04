import MovieClient from "./MovieClient";

export async function generateStaticParams() {
  const TMDB_BEARER = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZDY1MWFmYzllZDE1ODlkZTA4MjQxY2JkNmVmNjU5OSIsIm5iZiI6MTc4ODU1MjE2OS4yNjQsInN1YiI6IjZhOWIyM2U5MTA3NGJmY2M1ZDQxYmZhYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gIp9GeRIFdpKpvMpV2fdQpvKFOeliqDPAPGRy4qG1h4";
  try {
    const res = await fetch("https://api.themoviedb.org/3/discover/movie?with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=1&language=en-US", {
      headers: { Authorization: `Bearer ${TMDB_BEARER}` },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const ids = (data.results || []).slice(0, 30).map((r: any) => ({ id: String(r.id) }));
    const extra = ["129", "4935", "118340", "315162", "129865", "27205"];
    extra.forEach((id) => { if (!ids.find((x: any) => x.id === id)) ids.push({ id }); });
    return ids.slice(0, 40);
  } catch {
    return [{ id: "129" }, { id: "4935" }, { id: "118340" }];
  }
}

export default function Page() {
  return <MovieClient />;
}
