"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tmdb, tmdbImage, normalizeMovie } from "@/lib/tmdb";
import TrailerPlayer from "@/components/TrailerPlayer";
import CharacterGrid from "@/components/CharacterGrid";
import UniverseMap from "@/components/UniverseMap";
import CommentSection from "@/components/CommentSection";
import Reviews from "@/components/Reviews";
import { Star, Clock, Building2, Calendar, Heart, ListPlus, Share2 } from "lucide-react";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function MovieDetailPage() {
  const { id } = useParams<{id:string}>();
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const { toggleWatch, watchlist, updateStatus } = useStore();

  useEffect(()=>{
    if(!id) return;
    (async()=>{
      try{ const d=await tmdb.movieDetails(Number(id)); setData(d);}catch(e){console.error(e);}
      setLoading(false);
    })();
  },[id]);

  if(loading) return <div className="h-[60vh] rounded-[28px] bg-[#F3EDF7] dark:bg-[#211F26] animate-pulse"/>;
  if(!data) return <div className="p-10 text-center">Film bulunamadı. <Link href="/" className="text-[#6750A4] underline">Anasayfaya dön</Link></div>;

  const meta = normalizeMovie(data);
  const inList = watchlist.some(w=>w.tmdbId===data.id);
  const entry = watchlist.find(w=>w.tmdbId===data.id);

  return (
    <div className="space-y-6">
      <div className="relative rounded-[28px] overflow-hidden bg-[#1C1B1F] min-h-[520px]">
        <img src={tmdbImage.backdrop(data.backdrop_path,"w1280")} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70"/>
        <div className="absolute inset-0 hero-gradient"/>
        <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-end">
          <img src={tmdbImage.poster(data.poster_path,"w500")} alt="" className="w-[200px] lg:w-[260px] aspect-[2/3] object-cover rounded-2xl shadow-m3-3 border border-white/20 shrink-0"/>
          <div className="flex-1 min-w-0 text-white">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#FFD8E4] text-[#31111D] text-xs font-bold">MOVIE • ANIME FILM</span>
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20 text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{data.vote_average?.toFixed(1)} ({data.vote_count?.toLocaleString()} oy)</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur border border-white/20 text-xs">{data.status}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight">{data.title}</h1>
            <div className="text-white/70 text-sm">{data.original_title} • {data.original_language?.toUpperCase()} • {data.release_date}</div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {data.genres?.map((g:any)=> <span key={g.id} className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-medium">{g.name}</span>)}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 text-sm">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"><div className="text-white/60 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> Süre</div><div className="font-bold">{data.runtime} dakika • {(data.runtime/60).toFixed(1)} saat</div></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"><div className="text-white/60 text-xs flex items-center gap-1"><Calendar className="w-3 h-3"/> Vizyon</div><div className="font-bold">{data.release_date}</div></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"><div className="text-white/60 text-xs flex items-center gap-1"><Building2 className="w-3 h-3"/> Stüdyo</div><div className="font-bold truncate">{data.production_companies?.[0]?.name||"—"}</div></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"><div className="text-white/60 text-xs">Hasılat</div><div className="font-bold">{data.revenue? `$${(data.revenue/1000000).toFixed(1)}M` : "—"}</div></div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mt-4 max-w-3xl">{data.overview}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              <button onClick={()=>toggleWatch(data,"MOVIE")} className={`h-11 px-6 rounded-full font-semibold inline-flex items-center gap-2 ${inList?"bg-[#6750A4] text-white":"bg-white text-black"}`}><ListPlus className="w-4 h-4"/>{inList?"Listemde":"Listeye Ekle"}</button>
              <button onClick={()=> entry && updateStatus(data.id, "COMPLETED", 1)} className="h-11 px-6 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white font-semibold inline-flex items-center gap-2"><Heart className="w-4 h-4"/> {entry?.status==="COMPLETED"?"İzlendi ✓":"İzlendi Olarak İşaretle"}</button>
              <button className="h-11 w-11 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center"><Share2 className="w-4 h-4"/></button>
            </div>

            {entry && (
              <div className="mt-4 p-3 rounded-2xl bg-white text-black flex gap-2 items-center">
                <span className="text-sm font-semibold">Durum:</span>
                <select value={entry.status} onChange={e=>updateStatus(data.id, e.target.value as any)} className="h-9 rounded-full bg-[#F3EDF7] px-3 text-sm border">
                  <option value="WATCHING">Watching</option><option value="COMPLETED">Completed</option><option value="PLAN_TO_WATCH">Plan to Watch</option><option value="ON_HOLD">On Hold</option><option value="DROPPED">Dropped</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <TrailerPlayer videos={data.videos?.results||[]} title={data.title} />

      <UniverseMap recommendations={data.recommendations?.results||[]} similar={data.similar?.results||[]} type="movie"/>

      <div className="m3-card p-4 lg:p-6">
        <h3 className="font-bold text-lg mb-4">Oyuncular & Seiyuu</h3>
        <CharacterGrid cast={data.credits?.cast||[]} />
      </div>

      <Reviews animeId={data.id} />

      <CommentSection animeId={data.id} />
    </div>
  );
}
