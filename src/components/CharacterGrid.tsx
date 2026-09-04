"use client";
import { tmdbImage } from "@/lib/tmdb";

export default function CharacterGrid({ cast }: { cast:any[] }) {
  if(!cast?.length) return <div className="text-sm text-[#49454F]">Oyuncu bilgisi yok.</div>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {cast.slice(0,18).map((c:any)=>(
        <div key={c.id+c.character} className="rounded-2xl overflow-hidden bg-[#F3EDF7] dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#2B2930]">
          <img src={tmdbImage.profile(c.profile_path)} alt={c.name} className="w-full aspect-[3/4] object-cover"/>
          <div className="p-2.5">
            <div className="text-xs font-bold leading-tight line-clamp-1">{c.name}</div>
            <div className="text-[11px] text-[#6750A4] dark:text-[#D0BCFF] font-medium line-clamp-1">{c.character}</div>
            <div className="mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8DEF8] dark:bg-[#4F378B]">{c.order<5?"MAIN":"SUPPORTING"}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
