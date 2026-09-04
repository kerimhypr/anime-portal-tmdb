"use client";
import { useStore } from "@/lib/store";
import { tmdbImage } from "@/lib/tmdb";
import Link from "next/link";
import { Trash2, Star } from "lucide-react";

export default function WatchlistPage(){
  const { watchlist, updateStatus, toggleWatch, stats } = useStore();
  const tabs: any[] = ["ALL","WATCHING","COMPLETED","PLAN_TO_WATCH","ON_HOLD","DROPPED"];
  const labels: Record<string,string> = { ALL:"Tümü", WATCHING:"İzleniyor", COMPLETED:"Tamamlandı", PLAN_TO_WATCH:"Plan", ON_HOLD:"Beklemede", DROPPED:"Bırakıldı"};
  const [active,setActive]=useState("ALL");
  const filtered = active==="ALL"? watchlist : watchlist.filter(w=>w.status===active);

  return (
    <div className="space-y-6">
      <div className="m3-card p-6 flex flex-wrap gap-4 items-center bg-gradient-to-r from-[#F3EDF7] to-[#EADDFF]/40 dark:from-[#211F26] dark:to-[#2B2930]">
        <div>
          <h1 className="text-2xl font-black">Listem • Watch Progress Tracker</h1>
          <p className="text-sm text-[#49454F] dark:text-[#CAC4D0]">{watchlist.length} kayıt • {stats.totalCompleted} tamamlandı • {stats.totalHours} saat • {stats.totalDays} gün</p>
        </div>
        <div className="ml-auto flex gap-1.5 overflow-x-auto">
          {tabs.map(t=>(
            <button key={t} onClick={()=>setActive(t)} className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${active===t?"bg-[#6750A4] text-white border-[#6750A4]":"bg-white dark:bg-[#211F26] border-[#E7E0EC] dark:border-[#49454F]"}`}>{labels[t]}</button>
          ))}
        </div>
      </div>

      {filtered.length===0 ? (
        <div className="m3-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EADDFF] mx-auto flex items-center justify-center text-2xl">📺</div>
          <div className="font-bold mt-3">Listen boş</div>
          <div className="text-sm text-[#49454F]">Anasayfadan anime ekle, ilerlemeni takip et.</div>
          <Link href="/" className="m3-button mt-4 inline-flex">Keşfetmeye Başla</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e=>(
            <div key={e.id} className="m3-card overflow-hidden flex">
              <Link href={e.format==="MOVIE"?`/movie/${e.tmdbId}`:`/anime/${e.tmdbId}`} className="w-28 shrink-0">
                <img src={tmdbImage.poster(e.anime.posterPath,"w185")} alt="" className="w-full h-full object-cover min-h-[168px]"/>
              </Link>
              <div className="p-3 flex-1 min-w-0 flex flex-col">
                <Link href={e.format==="MOVIE"?`/movie/${e.tmdbId}`:`/anime/${e.tmdbId}`} className="font-semibold leading-tight line-clamp-2 hover:text-[#6750A4]">{e.anime.title.english||e.anime.title.romaji}</Link>
                <div className="text-xs text-[#49454F] flex items-center gap-1.5 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.format==="MOVIE"?"bg-[#FFD8E4] text-[#31111D]":"bg-[#EADDFF] text-[#21005D]"}`}>{e.format}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{e.anime.voteAverage?.toFixed(1)}</span>
                </div>

                <div className="mt-2 flex gap-2">
                  <select value={e.status} onChange={ev=>updateStatus(e.tmdbId, ev.target.value as any)} className="flex-1 h-8 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-2 text-xs">
                    <option value="WATCHING">Watching</option><option value="COMPLETED">Completed</option><option value="PLAN_TO_WATCH">Plan to Watch</option><option value="ON_HOLD">On Hold</option><option value="DROPPED">Dropped</option>
                  </select>
                  <button onClick={()=>toggleWatch({id:e.tmdbId}, e.format as "TV"|"MOVIE")} className="w-8 h-8 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] flex items-center justify-center"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>

                {e.format==="TV" && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs">Bölüm</span>
                    <button onClick={()=>updateStatus(e.tmdbId, e.status, Math.max(0,e.currentEpisode-1))} className="w-7 h-7 rounded-full bg-[#E8DEF8] dark:bg-[#4F378B] flex items-center justify-center text-sm font-bold">−</button>
                    <span className="text-sm font-bold min-w-[24px] text-center">{e.currentEpisode}</span>
                    <button onClick={()=>updateStatus(e.tmdbId, e.status, Math.min(e.totalEpisodes || 24, e.currentEpisode+1))} className="w-7 h-7 rounded-full bg-[#6750A4] text-white flex items-center justify-center text-sm font-bold disabled:opacity-40" disabled={e.currentEpisode >= (e.totalEpisodes || 24)}>+</button>
                    <span className="text-xs text-[#49454F]">/ {e.totalEpisodes || 24}</span>
                  </div>
                )}

                {e.score && <div className="text-xs mt-1">Puan: <span className="font-bold">{e.score}/10</span></div>}

                <div className="mt-auto pt-2">
                  <div className="h-1.5 bg-[#F3EDF7] dark:bg-[#2B2930] rounded-full overflow-hidden"><div className="h-full bg-[#6750A4] transition-all" style={{width: `${e.status==="COMPLETED"?100: e.format==="MOVIE"?0: Math.min(100, (e.currentEpisode/(e.totalEpisodes || 24))*100)}%`}}/></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
