"use client";
import { useEffect, useState } from "react";
import { Clock, Tv, Film } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb";
import Link from "next/link";

const DAYS = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];

function Countdown({ to }: { to:string }) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(t); },[]);
  const diff = new Date(to).getTime() - now;
  if(diff<=0) return <span className="text-[#6BCB77] font-bold text-xs">YAYINDA</span>;
  const h=Math.floor(diff/3600000), m=Math.floor(diff%3600000/60000), s=Math.floor(diff%60000/1000);
  return <span className="font-mono text-xs font-bold bg-[#21005D] text-white px-2 py-1 rounded-full">{String(h).padStart(2,"0")}:{String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}</span>;
}

export default function BroadcastCalendar({ items }: { items:any[] }) {
  const [day,setDay]=useState(new Date().getDay()===0?6:new Date().getDay()-1);
  // enrich items with fake schedule for demo: distribute across days with near future times
  const enriched = items.slice(0,21).map((it:any,i:number)=> {
    const d = i % 7;
    const base = new Date();
    base.setHours(20 + (i%4), (i*7)%60,0,0);
    // adjust to selected day offset
    const diff = d - (new Date().getDay()===0?6:new Date().getDay()-1);
    base.setDate(base.getDate()+diff);
    if(diff<0) base.setDate(base.getDate()+7);
    return { ...it, _day:d, _air: base.toISOString(), _ep: (it.number_of_episodes? it.number_of_episodes : 12) - (i%3) };
  });
  const filtered = enriched.filter(e=> e._day===day);

  return (
    <div className="m3-card p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-[#6750A4]"/> Yayın Akışı <span className="text-xs font-normal bg-[#EADDFF] dark:bg-[#4F378B] px-2 py-1 rounded-full">Canlı Geri Sayım</span></h3>
        <span className="text-xs text-[#49454F]">JST 20:00 • TRT 14:00</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
        {DAYS.map((d,i)=>(
          <button key={d} onClick={()=>setDay(i)} className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap border transition ${i===day?"bg-[#6750A4] text-white border-[#6750A4] shadow":"bg-[#F3EDF7] dark:bg-[#2B2930] border-transparent hover:border-[#E7E0EC]"}`}>{d}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((it:any)=>(
          <Link key={it.id} href={`/anime/${it.id}`} className="flex gap-3 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2930] hover:shadow-m3-1 transition border border-transparent hover:border-[#E7E0EC] dark:hover:border-[#49454F]">
            <img src={tmdbImage.poster(it.poster_path,"w185")} alt="" className="w-[64px] h-[88px] object-cover rounded-xl shrink-0"/>
            <div className="min-w-0 flex-1">
              <div className="text-xs flex items-center gap-1 text-[#6750A4] dark:text-[#D0BCFF] font-semibold"><Tv className="w-3 h-3"/> S1 • BÖLÜM {it._ep}</div>
              <div className="text-sm font-semibold leading-tight line-clamp-2">{it.name||it.original_name}</div>
              <div className="text-xs text-[#49454F] dark:text-[#CAC4D0]">{new Date(it._air).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})} JST</div>
              <div className="mt-2"><Countdown to={it._air}/></div>
            </div>
          </Link>
        ))}
        {filtered.length===0 && <div className="col-span-full py-10 text-center text-sm text-[#49454F]">Bu gün yayın yok — diğer günleri kontrol et.</div>}
      </div>
    </div>
  );
}
