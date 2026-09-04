"use client";
import Link from "next/link";
import { tmdbImage } from "@/lib/tmdb";
import { GitBranch, Film, Tv } from "lucide-react";

export default function UniverseMap({ recommendations, similar, type }: { recommendations:any[]; similar:any[]; type:"tv"|"movie" }) {
  const nodes = [...(recommendations||[]), ...(similar||[])].slice(0,8);
  if(!nodes.length) return null;
  const relTypes: any[] = ["SEQUEL","PREQUEL","SPIN_OFF","MOVIE","RELATED"];
  return (
    <div className="m3-card p-4 lg:p-6">
      <h3 className="font-bold flex items-center gap-2 mb-4"><GitBranch className="w-5 h-5 text-[#6750A4]"/> Universe & Relations Map <span className="text-xs font-normal bg-[#F3EDF7] dark:bg-[#2B2930] px-2 py-1 rounded-full">{nodes.length} bağlantı</span></h3>
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#6750A4]/40 via-[#E7E0EC] dark:via-[#49454F] to-transparent hidden lg:block"/>
        <div className="grid lg:grid-cols-2 gap-3">
          {nodes.map((n:any,i:number)=>(
            <Link key={n.id} href={n.media_type==="movie" || n.title ? `/movie/${n.id}` : `/anime/${n.id}`} className="flex gap-3 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26] hover:shadow-m3-1 transition border border-transparent hover:border-[#E7E0EC] group">
              <img src={tmdbImage.poster(n.poster_path,"w185")} alt="" className="w-16 h-24 object-cover rounded-xl shrink-0"/>
              <div className="min-w-0">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${relTypes[i%5]==="MOVIE"?"bg-[#FFD8E4] text-[#31111D]":"bg-[#EADDFF] text-[#21005D]"}`}>{relTypes[i%5]==="MOVIE"?<Film className="w-3 h-3"/>:<Tv className="w-3 h-3"/>}{relTypes[i%5].replace("_"," ")}</span>
                <div className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-[#6750A4]">{n.title||n.name}</div>
                <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] line-clamp-2">{n.overview?.slice(0,90)||"Bağlantılı evren içeriği"}</div>
                <div className="text-xs font-medium mt-1">★ {n.vote_average?.toFixed(1)} • {(n.release_date||n.first_air_date||"").slice(0,4)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
