"use client";
import { useEffect, useState } from "react";
import AnimeCard from "@/components/AnimeCard";
import FilterModal from "@/components/FilterModal";
import { tmdb } from "@/lib/tmdb";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";

export default function DiscoverPage() {
  const [q,setQ]=useState("");
  const [format,setFormat]=useState<"ALL"|"TV"|"MOVIE">("ALL");
  const [anime,setAnime]=useState<any[]>([]);
  const [movies,setMovies]=useState<any[]>([]);
  const [searchResults,setSearchResults]=useState<any[]>([]);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(false);
  const [filterOpen,setFilterOpen]=useState(false);
  const [filters,setFilters]=useState<any>({ genreInclude:[16], sort:"popularity.desc" });
  const [searching,setSearching]=useState(false);

  async function loadDiscover(p=1, append=false) {
    setLoading(true);
    try{
      if(format==="ALL" || format==="TV"){
        const d=await tmdb.discoverAnime(p, filters);
        setAnime(prev=> append? [...prev, ...(d.results||[])] : (d.results||[]));
      }
      if(format==="ALL" || format==="MOVIE"){
        const d=await tmdb.discoverAnimeMovies(p, filters);
        setMovies(prev=> append? [...prev, ...(d.results||[])] : (d.results||[]));
      }
    }catch(e){console.error(e);}
    setLoading(false);
  }

  useEffect(()=>{ if(!q) loadDiscover(1,false); },[filters, format]);
  useEffect(()=>{
    if(!q.trim()){ setSearching(false); setSearchResults([]); return; }
    const t=setTimeout(async()=>{
      setSearching(true);
      try{ const r=await tmdb.searchMulti(q); setSearchResults(r.results||[]); }catch{}
      setSearching(false);
    },400);
    return ()=>clearTimeout(t);
  },[q]);

  const showSearch = q.trim().length>0;

  return (
    <div className="space-y-6">
      <div className="m3-card p-4 lg:p-6">
        <h1 className="text-2xl font-black tracking-tight">Keşfet • Gelişmiş Arama</h1>
        <p className="text-sm text-[#49454F] dark:text-[#CAC4D0]">Tür, yıl, puan ve formata göre filtrele. TMDB'den canlı anime verisi.</p>

        <div className="flex flex-col lg:flex-row gap-3 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454F]"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ara... (Your Name, Attack on Titan, Studio Ghibli...)" className="w-full h-11 pl-10 pr-4 bg-[#F3EDF7] dark:bg-[#211F26] border border-transparent focus:border-[#6750A4] rounded-full text-sm outline-none"/>
          </div>
          <div className="flex gap-2">
            {[
              ["ALL","Tümü"],
              ["TV","TV Series"],
              ["MOVIE","Movie"],
            ].map(([v,l])=>(
              <button key={v} onClick={()=>setFormat(v as any)} className={`px-5 h-11 rounded-full text-sm font-semibold border ${format===v?"bg-[#6750A4] text-white border-[#6750A4]":"bg-white dark:bg-[#211F26] border-[#E7E0EC] dark:border-[#49454F]"}`}>{l}</button>
            ))}
            <button onClick={()=>setFilterOpen(true)} className="h-11 px-5 rounded-full bg-[#E8DEF8] dark:bg-[#4F378B] text-[#21005D] dark:text-white font-semibold inline-flex items-center gap-2"><SlidersHorizontal className="w-4 h-4"/> Filtre</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#EADDFF] text-[#21005D] font-bold">Include: {(filters.genreInclude||[]).join(",")||"16"}</span>
          {filters.year && <span className="text-xs px-2.5 py-1 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930]">Yıl: {filters.year}</span>}
          {filters.voteGte>0 && <span className="text-xs px-2.5 py-1 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930]">Puan ≥ {filters.voteGte}</span>}
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930]">Sırala: {filters.sort}</span>
        </div>
      </div>

      {showSearch ? (
        <div>
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">{searching && <Loader2 className="w-4 h-4 animate-spin"/>} Arama Sonuçları • "{q}" <span className="text-xs font-normal bg-[#F3EDF7] dark:bg-[#2B2930] px-2 py-1 rounded-full">{searchResults.length}</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((r:any)=> <AnimeCard key={r.id+r.media_type} item={r} format={r.media_type==="movie"?"movie":"tv"}/>)}
          </div>
          {searchResults.length===0 && !searching && <div className="py-16 text-center text-[#49454F]">Sonuç bulunamadı. Farklı anahtar kelime dene.</div>}
        </div>
      ) : (
        <>
          {(format==="ALL"||format==="TV") && (
            <div>
              <h2 className="font-bold text-lg mb-3">📺 Anime TV Series <span className="text-xs font-normal bg-[#EADDFF] text-[#21005D] px-2 py-1 rounded-full">{anime.length}</span></h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {anime.map(a=> <AnimeCard key={a.id} item={a} format="tv"/>)}
              </div>
            </div>
          )}
          {(format==="ALL"||format==="MOVIE") && (
            <div>
              <h2 className="font-bold text-lg mb-3">🎬 Anime Movies <span className="text-xs font-normal bg-[#FFD8E4] text-[#31111D] px-2 py-1 rounded-full">{movies.length}</span></h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map(m=> <AnimeCard key={m.id} item={m} format="movie"/>)}
              </div>
            </div>
          )}
          <div className="flex justify-center pt-4">
            <button disabled={loading} onClick={()=>{ const n=page+1; setPage(n); loadDiscover(n,true); }} className="m3-button-tonal px-8 disabled:opacity-50 inline-flex items-center gap-2">{loading && <Loader2 className="w-4 h-4 animate-spin"/>} Daha Fazla Yükle</button>
          </div>
        </>
      )}

      <FilterModal open={filterOpen} onClose={()=>setFilterOpen(false)} onApply={(f:any)=>{ setFilters(f); setFormat(f.format||format); }} initial={{...filters, format}}/>
    </div>
  );
}
