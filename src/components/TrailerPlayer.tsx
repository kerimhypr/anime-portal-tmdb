"use client";
import { useState } from "react";
import { Play, Maximize2, PictureInPicture2, Volume2, AlertTriangle, X, Settings2 } from "lucide-react";

export default function TrailerPlayer({ videos, title }: { videos:any[]; title:string }) {
  const [active, setActive] = useState(videos?.[0]?.key || null);
  const [theater,setTheater]=useState(false);
  const [quality,setQuality]=useState("1080p");
  const [showReport,setShowReport]=useState(false);
  const activeVideo = videos?.find(v=>v.key===active) || videos?.[0];

  if(!videos?.length) return (
    <div className="rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26] p-10 text-center border border-dashed border-[#79747E]/30">
      <div className="w-12 h-12 rounded-full bg-[#E8DEF8] dark:bg-[#49454F] mx-auto flex items-center justify-center mb-3">🎬</div>
      <div className="font-semibold">Fragman bulunamadı</div>
      <div className="text-sm text-[#49454F] dark:text-[#CAC4D0]">TMDB'de bu anime için resmi fragman henüz eklenmemiş.</div>
    </div>
  );

  return (
    <div className={`${theater?"fixed inset-0 z-[70] bg-black p-4 lg:p-6 flex flex-col":""}`}>
      <div className={`rounded-[24px] overflow-hidden bg-black shadow-m3-3 border border-[#2B2930] ${theater?"flex-1 flex flex-col":""}`}>
        <div className={`relative bg-black ${theater?"flex-1":"aspect-video"}`}>
          {active ? (
            <iframe
              key={active}
              src={`https://www.youtube.com/embed/${active}?autoplay=0&rel=0&modestbranding=1`}
              title={activeVideo?.name || title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/60">Fragman seçin</div>
          )}
          {theater && <button onClick={()=>setTheater(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center"><X className="w-5 h-5"/></button>}
        </div>

        <div className="bg-[#1C1B1F] text-white p-3 lg:p-4 flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#6750A4] text-xs font-bold">{activeVideo?.type || "Trailer"}</span>
            <span className="text-sm font-medium truncate max-w-[260px] lg:max-w-none">{activeVideo?.name || title}</span>
            <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-white/10 border border-white/15">{quality}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <select value={quality} onChange={e=>setQuality(e.target.value)} className="bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-xs outline-none">
              <option className="text-black">1080p</option><option className="text-black">720p</option><option className="text-black">480p</option>
            </select>
            <button onClick={()=>setTheater(!theater)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center" title="Theater"><Maximize2 className="w-4 h-4"/></button>
            <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 hidden sm:flex items-center justify-center" title="PiP"><PictureInPicture2 className="w-4 h-4"/></button>
            <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 hidden sm:flex items-center justify-center"><Volume2 className="w-4 h-4"/></button>
            <button onClick={()=>setShowReport(true)} className="px-3 h-9 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-semibold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Bildir</button>
          </div>
        </div>
      </div>

      <div className={`grid gap-3 mt-4 ${theater?"grid-cols-2 sm:grid-cols-3 lg:grid-cols-5":"grid-cols-1 sm:grid-cols-2"}`}>
        {videos.slice(0,6).map((v:any)=>(
          <button key={v.key||v.id} onClick={()=>setActive(v.key)} className={`text-left rounded-2xl overflow-hidden border-2 transition ${active===v.key?"border-[#6750A4] bg-[#EADDFF] dark:bg-[#2B2930]":"border-transparent bg-[#F3EDF7] dark:bg-[#211F26] hover:border-[#E7E0EC] dark:hover:border-[#49454F]"}`}>
            <div className="relative aspect-video bg-black">
              <img src={`https://img.youtube.com/vi/${v.key}/hqdefault.jpg`} alt={v.name} className="w-full h-full object-cover"/>
              <span className="absolute inset-0 flex items-center justify-center"><span className="w-9 h-9 rounded-full bg-white/90 text-black flex items-center justify-center shadow"><Play className="w-4 h-4 fill-black ml-0.5"/></span></span>
              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">{v.type}</span>
            </div>
            <div className="p-2.5">
              <div className="text-xs font-semibold leading-tight line-clamp-2">{v.name}</div>
              <div className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">{new Date(v.published_at||v.publishedAt||Date.now()).toLocaleDateString("tr-TR")}</div>
            </div>
          </button>
        ))}
      </div>

      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowReport(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-md bg-white dark:bg-[#211F26] rounded-[28px] p-6 shadow-m3-3">
            <div className="flex items-center justify-between mb-2"><h3 className="font-bold text-lg">Sorun Bildir</h3><button onClick={()=>setShowReport(false)} className="w-8 h-8 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] flex items-center justify-center"><X className="w-4 h-4"/></button></div>
            <p className="text-sm text-[#49454F] dark:text-[#CAC4D0] mb-4">Bozuk fragman, yanlış bilgi veya uygunsuz içerik bildirin. Ekibimiz 24 saat içinde inceleyecektir.</p>
            <select className="w-full h-11 rounded-xl border border-[#79747E]/30 px-3 bg-[#F3EDF7] dark:bg-[#2B2930] text-sm"><option>Bozuk fragman</option><option>Yanlış bilgi</option><option>Uygunsuz içerik</option></select>
            <textarea placeholder="Detaylar..." className="w-full mt-3 min-h-[90px] rounded-xl border border-[#79747E]/30 p-3 bg-[#F3EDF7] dark:bg-[#2B2930] text-sm outline-none"/>
            <button onClick={()=>setShowReport(false)} className="m3-button w-full mt-4">Gönder</button>
          </div>
        </div>
      )}
    </div>
  );
}
