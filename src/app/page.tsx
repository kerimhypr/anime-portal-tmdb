"use client";
import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import { AnimeRail } from "@/components/AnimeCard";
import BroadcastCalendar from "@/components/BroadcastCalendar";
import Forum from "@/components/Forum";
import Shoutbox from "@/components/Shoutbox";
import Analytics from "@/components/Analytics";
import FilterModal from "@/components/FilterModal";
import PublicLists from "@/components/PublicLists";
import { tmdb } from "@/lib/tmdb";
import { createRequest } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { SlidersHorizontal, Film, Tv } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const [trending, setTrending] = useState<any[]>([]);
  const [animePop, setAnimePop] = useState<any[]>([]);
  const [moviePop, setMoviePop] = useState<any[]>([]);
  const [topTv, setTopTv] = useState<any[]>([]);
  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [onAir, setOnAir] = useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<any>({ genreInclude:[16] });
  const [loading,setLoading]=useState(true);
  const [reqName,setReqName]=useState("");
  const [reqLink,setReqLink]=useState("");
  const [reqDetails,setReqDetails]=useState("");
  const [reqSending,setReqSending]=useState(false);

  async function load() {
    setLoading(true);
    try{
      const [tr, popTv, popMv, topT, topM, air] = await Promise.all([
        tmdb.trendingAnime(),
        tmdb.discoverAnime(1, filters),
        tmdb.discoverAnimeMovies(1, filters),
        tmdb.topRatedTv(),
        tmdb.topRatedMovies(),
        tmdb.onTheAir(),
      ]);
      // filter japanese-ish
      const jp = (tr.results||[]).filter((x:any)=> x.original_language==="ja" || true).slice(0,6);
      setTrending(jp.length? jp : (popTv.results||[]).slice(0,6));
      setAnimePop(popTv.results||[]);
      setMoviePop(popMv.results||[]);
      setTopTv(topT.results||[]);
      setTopMovies(topM.results||[]);
      // Yayın Akışı sadece anime TV – film bug fix
      const animeAir = (air.results||[]).filter((x:any)=> x.original_language==="ja" || (x.genre_ids && x.genre_ids.includes(16)));
      setOnAir(animeAir.length ? animeAir : (air.results||[]).filter((x:any)=> !x.title).slice(0,12));
    }catch(e){ console.error(e); }
    setLoading(false);
  }

  useEffect(()=>{ load(); },[filters]);
  useEffect(()=>{
    const sp = new URLSearchParams(window.location.search);
    if(sp.get("random")==="1"){
      // handled via button elsewhere; still could random navigate
    }
  },[]);

  if(loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-[520px] rounded-[28px] bg-[#F3EDF7] dark:bg-[#211F26]"/>
        <div className="h-40 rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26]"/>
        <div className="h-40 rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26]"/>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Hero featured={trending} />

      {/* quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {k:"TV Series", v:`${animePop.length}+`, d:"Japon Animesi", icon:Tv, c:"bg-[#EADDFF] text-[#21005D]"},
          {k:"Anime Movies", v:`${moviePop.length}+`, d:"Sinema Filmleri", icon:Film, c:"bg-[#FFD8E4] text-[#31111D]"},
          {k:"Sıfır Manga", v:"0", d:"Yalnızca Anime", icon:Tv, c:"bg-[#E8DEF8] text-[#1D192B]"},
          {k:"TMDB", v:"Canlı", d:"Güncel Metadata", icon:Film, c:"bg-[#FFF9C4] text-[#31111D]"},
        ].map(card=>(
          <div key={card.k} className="rounded-2xl p-4 bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#2B2930] flex items-center gap-3">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.c}`}><card.icon className="w-5 h-5"/></span>
            <div><div className="text-xs text-[#49454F] dark:text-[#CAC4D0]">{card.k}</div><div className="font-black leading-none">{card.v}</div><div className="text-xs text-[#49454F]">{card.d}</div></div>
          </div>
        ))}
      </div>

      {/* filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={()=>setFilterOpen(true)} className="inline-flex items-center gap-2 px-4 h-11 rounded-full bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] text-sm font-medium shadow-sm"><SlidersHorizontal className="w-4 h-4"/> Filtrele • Tür / Yıl / Puan / Format</button>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-[#6750A4] text-white text-xs font-bold">Format: {filters.format||"ALL"}</span>
          {filters.year && <span className="px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-xs font-medium">Yıl: {filters.year}</span>}
          {filters.voteGte>0 && <span className="px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-xs">Puan ≥ {filters.voteGte}</span>}
        </div>
        <Link href="/discover" className="ml-auto text-sm font-medium text-[#6750A4] dark:text-[#D0BCFF] hover:underline">Gelişmiş Keşif →</Link>
      </div>

      <AnimeRail title="🔥 Haftanın Trend Animeleri (TV)" items={animePop.slice(0,12)} format="tv" href="/discover?format=TV" />
      <AnimeRail title="🎬 Anime Filmleri — Sinema Seçkisi" items={moviePop.slice(0,12)} format="movie" href="/discover?format=MOVIE" />
      <AnimeRail title="⭐ En Yüksek Puanlılar — TV" items={topTv.slice(0,12)} format="tv" />
      <AnimeRail title="🏆 En Yüksek Puanlı Filmler" items={topMovies.slice(0,12)} format="movie" />

      <BroadcastCalendar items={onAir.slice(0,21)} />

      <div className="grid lg:grid-cols-[1.7fr_0.9fr] gap-6">
        <Forum />
        <Shoutbox />
      </div>

      <Analytics />

      <PublicLists />

      {/* request system */}
      <div className="m3-card p-6 bg-gradient-to-br from-[#F3EDF7] to-[#EADDFF]/50 dark:from-[#211F26] dark:to-[#2B2930]">
        <h3 className="font-bold text-lg">İçerik İsteği • Eksik Anime Bildir</h3>
        <p className="text-sm text-[#49454F] dark:text-[#CAC4D0]">Listede olmayan bir anime/film mi var? Ya da hatalı bilgi mi gördün? Ekibimize ilet, 24 saat içinde ekleyelim.</p>
        <form onSubmit={async(e)=>{ e.preventDefault(); if(!reqName.trim()) return; setReqSending(true); try{ await createRequest(user?.uid||null, reqName, reqLink, reqDetails); alert("İsteğiniz alındı! Teşekkürler 🙏"); setReqName(""); setReqLink(""); setReqDetails(""); }catch(err:any){ alert(err.message);} finally{ setReqSending(false);} }} className="grid md:grid-cols-2 gap-3 mt-4">
          <input value={reqName} onChange={e=>setReqName(e.target.value)} required placeholder="Anime / Film adı" className="h-11 rounded-xl px-4 bg-white dark:bg-[#141218] border border-[#E7E0EC] dark:border-[#49454F] text-sm outline-none focus:border-[#6750A4]"/>
          <input value={reqLink} onChange={e=>setReqLink(e.target.value)} placeholder="TMDB / MAL linki (opsiyonel)" className="h-11 rounded-xl px-4 bg-white dark:bg-[#141218] border border-[#E7E0EC] dark:border-[#49454F] text-sm outline-none"/>
          <textarea value={reqDetails} onChange={e=>setReqDetails(e.target.value)} placeholder="Detaylar / düzeltme..." className="md:col-span-2 min-h-[90px] rounded-xl p-3 bg-white dark:bg-[#141218] border border-[#E7E0EC] dark:border-[#49454F] text-sm outline-none"/>
          <button disabled={reqSending} className="m3-button md:col-span-2 disabled:opacity-60">{reqSending?"Gönderiliyor...":"Gönder"}</button>
        </form>
      </div>

      <FilterModal open={filterOpen} onClose={()=>setFilterOpen(false)} onApply={setFilters} initial={filters}/>

      {/* FAB random */}
      <button onClick={async()=>{
        const all = [...animePop, ...moviePop];
        const pick = all[Math.floor(Math.random()*all.length)];
        if(!pick) return;
        const isM = !!pick.title;
        window.location.href = isM? `/movie/${pick.id}` : `/anime/${pick.id}`;
      }} className="fixed bottom-6 right-6 m3-fab shadow-m3-3 z-40">
        🎲 Surprise Me
      </button>
    </div>
  );
}
