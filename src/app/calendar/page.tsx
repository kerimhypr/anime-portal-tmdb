"use client";
import { useEffect, useState } from "react";
import BroadcastCalendar from "@/components/BroadcastCalendar";
import { tmdb } from "@/lib/tmdb";
import Link from "next/link";

export default function CalendarPage(){
  const [onAir,setOnAir]=useState<any[]>([]);
  const [upcoming,setUpcoming]=useState<any[]>([]);
  useEffect(()=>{
    (async()=>{
      const [a,u]=await Promise.all([tmdb.onTheAir(), tmdb.upcomingMovies()]);
      setOnAir(a.results||[]);
      setUpcoming(u.results||[]);
    })();
  },[]);
  return (
    <div className="space-y-6">
      <div className="m3-card p-6 bg-gradient-to-r from-[#6750A4] to-[#7D5260] text-white">
        <h1 className="text-2xl font-black">Yayın Akışı • Haftalık Takvim</h1>
        <p className="text-white/80 text-sm">Günlük yayınlar, canlı geri sayım ve yakında vizyona girecek anime filmleri.</p>
      </div>
      <BroadcastCalendar items={onAir.slice(0,21)} />

      <div className="m3-card p-4 lg:p-6">
        <h3 className="font-bold text-lg mb-4">🎬 Yakında • Anime Filmleri</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcoming.slice(0,9).map((m:any)=>(
            <Link key={m.id} href={`/movie/${m.id}`} className="flex gap-3 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26] hover:shadow-m3-1 transition">
              <img src={m.poster_path?`https://image.tmdb.org/t/p/w185${m.poster_path}`:"https://via.placeholder.com/185x278/6750A4/FFF?text=?"} alt="" className="w-16 h-24 object-cover rounded-xl"/>
              <div><div className="text-sm font-semibold leading-tight line-clamp-2">{m.title}</div><div className="text-xs text-[#49454F]">{m.release_date} • ★ {m.vote_average?.toFixed(1)}</div><div className="text-xs line-clamp-2 text-[#49454F]/80 mt-1">{m.overview?.slice(0,90)}</div></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
