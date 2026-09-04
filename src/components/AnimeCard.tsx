"use client";
import Link from "next/link";
import { Star, Play, Heart, Plus, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { tmdbImage } from "@/lib/tmdb";

export default function AnimeCard({ item, format }: { item:any; format?: "tv"|"movie" }) {
  const inferred = format || (item.media_type==="movie" || item.title ? "movie" : "tv");
  const isMovie = inferred==="movie";
  const id = item.id;
  const title = item.name || item.title || item.original_name || item.original_title;
  const year = (item.first_air_date || item.release_date || "").slice(0,4);
  const { watchlist, toggleWatch } = useStore();
  const inList = watchlist.some(w=>w.tmdbId===id);
  const href = isMovie? `/movie/${id}` : `/anime/${id}`;

  return (
    <div className="group relative">
      <Link href={href} className="block">
        <div className="relative aspect-[2/3] rounded-[20px] overflow-hidden bg-[#E7E0EC] dark:bg-[#2B2930] shadow-m3-1 group-hover:shadow-m3-3 transition-all duration-300">
          <img src={tmdbImage.poster(item.poster_path,"w500")} alt={title} className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500" loading="lazy"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-transparent opacity-60"/>
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide ${isMovie?"bg-[#FFD8E4] text-[#31111D]":"bg-[#EADDFF] text-[#21005D]"}`}>{isMovie?"MOVIE":"TV"}</span>
            {item.vote_average>8 && <span className="px-2 py-1 rounded-full bg-[#FFD93D] text-black text-[10px] font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-black"/> TOP</span>}
          </div>
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
            <Play className="w-4 h-4 fill-white ml-0.5"/>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-1.5 text-white/90 text-xs mb-1">
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur px-2 py-1 rounded-full"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{item.vote_average?.toFixed(1) || "—"}</span>
              <span className="bg-black/40 backdrop-blur px-2 py-1 rounded-full">{year || "—"}</span>
            </div>
            <div className="text-white font-semibold leading-tight line-clamp-2 text-[13px] drop-shadow">{title}</div>
            <div className="text-white/70 text-xs truncate">{item.original_name || item.original_title || ""}</div>
          </div>
        </div>
      </Link>
      <button onClick={(e)=>{ e.preventDefault(); toggleWatch(item, isMovie?"MOVIE":"TV"); }} className={`absolute -bottom-3 right-3 w-9 h-9 rounded-full shadow-m3-2 flex items-center justify-center transition ${inList?"bg-[#6750A4] text-white":"bg-white dark:bg-[#2B2930] text-[#6750A4] dark:text-white border border-[#E7E0EC] dark:border-[#49454F]"}`}>
        {inList ? <Check className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
      </button>
    </div>
  );
}

export function AnimeRail({ title, items, format, href }: { title:string; items:any[]; format?:"tv"|"movie"; href?:string }) {
  if(!items?.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold tracking-tight flex items-center gap-2">{title} <span className="text-xs font-normal bg-[#E8DEF8] dark:bg-[#2B2930] px-2 py-1 rounded-full">{items.length}</span></h2>
        {href && <Link href={href} className="text-sm font-medium text-[#6750A4] dark:text-[#D0BCFF] hover:underline">Tümünü gör →</Link>}
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
        {items.map((it:any)=> <div key={`${format}-${it.id}`} className="min-w-[158px] w-[158px] sm:min-w-[168px] sm:w-[168px] snap-start"><AnimeCard item={it} format={format}/></div>)}
      </div>
    </section>
  );
}
