"use client";
import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";

const GENRES = [
  {id:16,name:"Animation"},{id:28,name:"Action"},{id:12,name:"Adventure"},{id:35,name:"Comedy"},{id:18,name:"Drama"},{id:14,name:"Fantasy"},{id:878,name:"Sci-Fi"},{id:10749,name:"Romance"},{id:27,name:"Horror"},{id:9648,name:"Mystery"},{id:53,name:"Thriller"},{id:10751,name:"Family"}
];
const YEARS = Array.from({length:26},(_,i)=> 2026-i);
const SEASONS = ["Kış","İlkbahar","Yaz","Sonbahar"];

export default function FilterModal({ open, onClose, onApply, initial }: { open:boolean; onClose:()=>void; onApply:(f:any)=>void; initial:any }) {
  const [include,setInclude]=useState<number[]>(initial?.genreInclude||[16]);
  const [exclude,setExclude]=useState<number[]>(initial?.genreExclude||[]);
  const [year,setYear]=useState<number|undefined>(initial?.year);
  const [format,setFormat]=useState(initial?.format||"ALL");
  const [score,setScore]=useState(initial?.voteGte||0);
  const [sort,setSort]=useState(initial?.sort||"popularity.desc");

  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-[720px] bg-white dark:bg-[#211F26] rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-auto shadow-m3-3">
        <div className="sticky top-0 bg-white dark:bg-[#211F26] p-5 border-b border-[#E7E0EC] dark:border-[#2B2930] flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-[#6750A4]"/> Çoklu Filtre</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] flex items-center justify-center"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5 space-y-6">
          <div>
            <div className="text-sm font-semibold mb-2">Format</div>
            <div className="flex gap-2">
              {[
                ["ALL","Tümü"],["TV","TV Series"],["MOVIE","Movie"]
              ].map(([v,l])=>(
                <button key={v} onClick={()=>setFormat(v)} className={`flex-1 h-11 rounded-full border font-medium text-sm ${format===v?"bg-[#6750A4] text-white border-[#6750A4]":"bg-[#F3EDF7] dark:bg-[#2B2930] border-transparent"}`}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Dahil Et (Include)</div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g=>(
                <button key={g.id} onClick={()=> setInclude(s=> s.includes(g.id)? s.filter(x=>x!==g.id): [...s,g.id])} className={`px-3.5 py-2 rounded-full text-sm border font-medium ${include.includes(g.id)?"bg-[#6750A4] text-white border-[#6750A4]":"bg-[#F3EDF7] dark:bg-[#2B2930] border-[#E7E0EC] dark:border-[#49454F]"}`}>{g.name}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Hariç Tut (Exclude)</div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g=>(
                <button key={"ex"+g.id} onClick={()=> setExclude(s=> s.includes(g.id)? s.filter(x=>x!==g.id): [...s,g.id])} className={`px-3.5 py-2 rounded-full text-sm border font-medium ${exclude.includes(g.id)?"bg-[#BA1A1A] text-white border-[#BA1A1A]":"bg-[#F3EDF7] dark:bg-[#2B2930] border-[#E7E0EC] dark:border-[#49454F]"}`}>{g.name}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold mb-2">Yıl</div>
              <select value={year||""} onChange={e=>setYear(e.target.value? Number(e.target.value): undefined)} className="w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-3 text-sm">
                <option value="">Tümü</option>
                {YEARS.map(y=> <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Sezon</div>
              <div className="flex gap-1.5">
                {SEASONS.map(s=> <button key={s} className="flex-1 h-11 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-xs font-medium border border-transparent">{s}</button>)}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">TMDB Skoru ≥ {score}</div>
            <input type="range" min={0} max={9} step={0.5} value={score} onChange={e=>setScore(Number(e.target.value))} className="w-full accent-[#6750A4]"/>
            <div className="flex justify-between text-xs text-[#49454F]"><span>0</span><span>4.5</span><span>9+</span></div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Sırala</div>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-3 text-sm">
              <option value="popularity.desc">Popülerlik ↓</option>
              <option value="vote_average.desc">Puan ↓</option>
              <option value="primary_release_date.desc">Yeniler</option>
              <option value="revenue.desc">Hasılat</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={()=>{ setInclude([16]); setExclude([]); setYear(undefined); setScore(0); setFormat("ALL");}} className="flex-1 h-12 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] font-medium">Sıfırla</button>
            <button onClick={()=>{ onApply({ genreInclude:include, genreExclude:exclude, year, format, voteGte:score, sort }); onClose(); }} className="flex-1 h-12 rounded-full bg-[#6750A4] text-white font-semibold">Uygula • Filtrele</button>
          </div>
        </div>
      </div>
    </div>
  );
}
