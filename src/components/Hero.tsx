"use client";
import { useEffect, useState } from "react";
import { Play, Info, Star, Calendar, Clock, Plus, Check } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function Hero({ featured }: { featured:any[] }) {
  const [idx,setIdx]=useState(0);
  const { toggleWatch, watchlist } = useStore();
  const current = featured[idx];
  useEffect(()=>{
    if(!featured.length) return;
    const t=setInterval(()=> setIdx(i=> (i+1)%featured.length), 6000);
    return ()=>clearInterval(t);
  },[featured.length]);
  if(!current) return null;
  const isMovie = !!current.title;
  const title = current.name || current.title;
  const year = (current.first_air_date||current.release_date||"").slice(0,4);
  const inList = watchlist.some(w=>w.tmdbId===current.id);

  return (
    <div className="relative rounded-[28px] overflow-hidden bg-[#1C1B1F] min-h-[480px] lg:min-h-[520px] flex flex-col justify-end">
      <img src={tmdbImage.backdrop(current.backdrop_path,"w1280")} alt={title} className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0 hero-gradient"/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#6750A4]/30 via-transparent to-transparent"/>

      <div className="relative p-6 lg:p-10 max-w-3xl">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur text-white text-xs border border-white/20 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{current.vote_average?.toFixed(1)} • {year}</span>
        </div>
        <h1 className="text-3xl lg:text-5xl font-black leading-[0.95] tracking-tight text-white drop-shadow-lg">{title}</h1>
        <p className="text-white/80 text-sm lg:text-[15px] leading-relaxed line-clamp-3 mt-3 max-w-2xl">{current.overview || "Japon animasyonunun zirvesi — sinematik anlatım, nefes kesen görseller ve unutulmaz karakterler."}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href={isMovie?`/movie?id=${current.id}`:`/anime?id=${current.id}`} className="h-12 px-7 rounded-full bg-white text-black font-semibold inline-flex items-center gap-2 hover:bg-zinc-100 transition"><Play className="w-5 h-5 fill-black"/> Fragmanı İzle</Link>
          <Link href={isMovie?`/movie?id=${current.id}`:`/anime?id=${current.id}`} className="h-12 px-7 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white font-semibold inline-flex items-center gap-2 hover:bg-white/20 transition"><Info className="w-5 h-5"/> Detaylar</Link>
          <button onClick={()=>toggleWatch(current, isMovie?"MOVIE":"TV")} className={`h-12 px-6 rounded-full font-semibold inline-flex items-center gap-2 border transition ${inList?"bg-[#6750A4] border-[#6750A4] text-white":"bg-black/30 backdrop-blur border-white/20 text-white hover:bg-black/40"}`}>{inList?<Check className="w-5 h-5"/>:<Plus className="w-5 h-5"/>}{inList?"Listemde":"Listeye Ekle"}</button>
        </div>

        <div className="flex items-center gap-2 mt-6">
          {featured.slice(0,6).map((_,i)=>(
            <button key={i} onClick={()=>setIdx(i)} className={`h-1.5 rounded-full transition-all ${i===idx?"w-10 bg-white":"w-6 bg-white/40 hover:bg-white/70"}`}/>
          ))}
        </div>
      </div>

      {/* mini poster */}
      <div className="hidden lg:block absolute right-10 bottom-10 w-[180px]">
        <div className="rounded-2xl overflow-hidden shadow-m3-3 border border-white/20">
          <img src={tmdbImage.poster(current.poster_path,"w500")} alt="" className="w-full aspect-[2/3] object-cover"/>
        </div>
        <div className="mt-3 bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15 text-white">
          <div className="text-xs opacity-80 flex items-center gap-2"><Calendar className="w-3 h-3"/>{year} • <Clock className="w-3 h-3"/> 24dk</div>
          <div className="text-sm font-semibold leading-tight mt-1">{title}</div>
        </div>
      </div>
    </div>
  );
}
