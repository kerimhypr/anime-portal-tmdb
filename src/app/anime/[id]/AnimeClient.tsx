"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tmdb, tmdbImage, normalizeTv } from "@/lib/tmdb";
import TrailerPlayer from "@/components/TrailerPlayer";
import CharacterGrid from "@/components/CharacterGrid";
import UniverseMap from "@/components/UniverseMap";
import CommentSection from "@/components/CommentSection";
import Reviews from "@/components/Reviews";
import { Star, Calendar, Tv, Clock, Building2, Shield, Heart, ListPlus, Share2, StarIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function AnimeDetailPage() {
  const { id } = useParams<{id:string}>();
  const [data,setData]=useState<any>(null);
  const [seasonEpisodes,setSeasonEpisodes]=useState<any[]>([]);
  const [activeSeason,setActiveSeason]=useState(1);
  const [loading,setLoading]=useState(true);
  const { toggleWatch, watchlist, updateStatus } = useStore();

  useEffect(()=>{
    if(!id) return;
    (async()=>{
      try{
        const d = await tmdb.tvDetails(Number(id));
        setData(d);
        if(d.seasons?.[0]) {
          const s = d.seasons.find((x:any)=> x.season_number>0) || d.seasons[0];
          setActiveSeason(s.season_number);
          try{ const sd = await tmdb.tvSeason(Number(id), s.season_number); setSeasonEpisodes(sd.episodes||[]);}catch{}
        }
      }catch(e){ console.error(e); }
      setLoading(false);
    })();
  },[id]);

  useEffect(()=>{
    if(!id) return;
    (async()=>{
      try{ const sd = await tmdb.tvSeason(Number(id), activeSeason); setSeasonEpisodes(sd.episodes||[]);}catch{}
    })();
  },[activeSeason, id]);

  if(loading) return <div className="h-[60vh] rounded-[28px] bg-[#F3EDF7] dark:bg-[#211F26] animate-pulse"/>;
  if(!data) return <div className="p-10 text-center">Anime bulunamadı. <Link href="/" className="text-[#6750A4] underline">Anasayfaya dön</Link></div>;

  const meta = normalizeTv(data);
  const inList = watchlist.some(w=>w.tmdbId===data.id);
  const entry = watchlist.find(w=>w.tmdbId===data.id);

  return (
    <div className="space-y-6">
      {/* hero */}
      <div className="relative rounded-[28px] overflow-hidden bg-[#1C1B1F] min-h-[520px]">
        <img src={tmdbImage.backdrop(data.backdrop_path,"w1280")} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70"/>
        <div className="absolute inset-0 hero-gradient"/>
        <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-end">
          <img src={tmdbImage.poster(data.poster_path,"w500")} alt="" className="w-[200px] lg:w-[260px] aspect-[2/3] object-cover rounded-2xl shadow-m3-3 border border-white/20 shrink-0"/>
          <div className="flex-1 min-w-0 text-white">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#EADDFF] text-[#21005D] text-xs font-bold">TV • ANIME</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${meta.status==="Ongoing"?"bg-[#6BCB77] text-black":"bg-white/20 backdrop-blur border border-white/20"}`}>{meta.status==="Ongoing"?"ONGOING • Devam Ediyor":"FINISHED • Tamamlandı"}</span>
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20 text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{data.vote_average?.toFixed(1)} ({data.vote_count?.toLocaleString()} oy)</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight">{data.name}</h1>
            <div className="text-white/70 text-sm mt-1">{data.original_name} • {data.original_language?.toUpperCase()} • {(data.first_air_date||"").slice(0,4)}–{(data.last_air_date||"").slice(0,4)||"?"}</div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {data.genres?.map((g:any)=> <span key={g.id} className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-medium">{g.name}</span>)}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 text-sm">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"><div className="text-white/60 text-xs flex items-center gap-1"><Tv className="w-3 h-3"/> Sezon</div><div className="font-bold">{data.number_of_seasons} sezon • {data.number_of_episodes} bölüm</div></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"><div className="text-white/60 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> Süre</div><div className="font-bold">{data.episode_run_time?.[0]||24} dk / bölüm</div></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"><div className="text-white/60 text-xs flex items-center gap-1"><Building2 className="w-3 h-3"/> Stüdyo</div><div className="font-bold truncate">{data.networks?.[0]?.name || data.production_companies?.[0]?.name || "—"}</div></div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15"><div className="text-white/60 text-xs flex items-center gap-1"><Shield className="w-3 h-3"/> Yaş</div><div className="font-bold">{meta.ageRating}</div></div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mt-4 line-clamp-4 max-w-3xl">{data.overview || "Açıklama bulunamadı."}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              <button onClick={()=>toggleWatch(data,"TV")} className={`h-11 px-6 rounded-full font-semibold inline-flex items-center gap-2 ${inList?"bg-[#6750A4] text-white":"bg-white text-black"}`}><ListPlus className="w-4 h-4"/>{inList?"Listemde":"Listeye Ekle"}</button>
              <button onClick={()=> {
                if(!entry) return;
                const max = entry.totalEpisodes || data.number_of_episodes || 24;
                const next = Math.min(max, entry.currentEpisode+1);
                updateStatus(data.id, entry.status==="WATCHING" && next>=max ? "COMPLETED" : entry.status==="WATCHING"?"WATCHING":"WATCHING", next);
              }} className="h-11 px-6 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white font-semibold inline-flex items-center gap-2"><Heart className="w-4 h-4"/> {entry?.status==="WATCHING"?"Bölüm İlerlet":"İzlemeye Başla"}</button>
              <button className="h-11 w-11 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center"><Share2 className="w-4 h-4"/></button>
            </div>

            {entry && (
              <div className="mt-4 p-3 rounded-2xl bg-white text-black flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold">Takip:</span>
                <select value={entry.status} onChange={e=>updateStatus(data.id, e.target.value as any)} className="h-9 rounded-full bg-[#F3EDF7] px-3 text-sm border">
                  <option value="WATCHING">Watching</option><option value="COMPLETED">Completed</option><option value="ON_HOLD">On Hold</option><option value="DROPPED">Dropped</option><option value="PLAN_TO_WATCH">Plan to Watch</option>
                </select>
                <span className="text-sm">Bölüm</span>
                <input type="number" min={0} max={data.number_of_episodes || 999} value={entry.currentEpisode} onChange={e=>{
                  const v = Number(e.target.value);
                  const max = data.number_of_episodes || entry.totalEpisodes || 24;
                  const clamped = Math.max(0, Math.min(max, isNaN(v)?0:v));
                  updateStatus(data.id, entry.status, clamped);
                }} className="w-20 h-9 rounded-full bg-[#F3EDF7] px-3 text-sm border text-center"/>
                <span className="text-sm">/ {data.number_of_episodes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* trailer */}
      <TrailerPlayer videos={data.videos?.results||[]} title={data.name} />

      {/* seasons & episodes */}
      <div className="m3-card p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Sezonlar & Bölüm Rehberi</h3>
          <span className="text-xs bg-[#F3EDF7] dark:bg-[#2B2930] px-2.5 py-1 rounded-full">{data.seasons?.length} sezon</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
          {data.seasons?.map((s:any)=>(
            <button key={s.id} onClick={()=>setActiveSeason(s.season_number)} className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap border ${activeSeason===s.season_number?"bg-[#6750A4] text-white border-[#6750A4]":"bg-[#F3EDF7] dark:bg-[#2B2930] border-transparent"}`}>S{s.season_number} • {s.episode_count} bl</button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {seasonEpisodes.map((ep:any)=>(
            <div key={ep.id} className="flex gap-3 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26] border border-[#E7E0EC]/50 dark:border-[#2B2930]">
              <img src={ep.still_path? `https://image.tmdb.org/t/p/w300${ep.still_path}` : tmdbImage.poster(data.poster_path,"w300")} alt="" className="w-28 h-[72px] object-cover rounded-xl shrink-0"/>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#6750A4]">S{ep.season_number} • B{ep.episode_number}</div>
                <div className="text-sm font-semibold leading-tight line-clamp-1">{ep.name}</div>
                <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] line-clamp-2">{ep.overview?.slice(0,110)||"Bölüm açıklaması bulunamadı."}</div>
                <div className="text-[11px] text-[#79747E] mt-1">{ep.air_date||"—"} • {ep.runtime? `${ep.runtime}dk`: "—"} • ★ {ep.vote_average?.toFixed(1)||"—"}</div>
              </div>
            </div>
          ))}
          {seasonEpisodes.length===0 && <div className="col-span-full py-8 text-center text-sm text-[#49454F]">Bu sezon için bölüm bilgisi yüklenemedi.</div>}
        </div>
      </div>

      <UniverseMap recommendations={data.recommendations?.results||[]} similar={data.similar?.results||[]} type="tv"/>

      <div className="m3-card p-4 lg:p-6">
        <h3 className="font-bold text-lg mb-4">Karakterler & Seiyuu</h3>
        <CharacterGrid cast={data.aggregate_credits?.cast||[]} />
      </div>

      <Reviews animeId={data.id} />

      <CommentSection animeId={data.id} />
    </div>
  );
}
