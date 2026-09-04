"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { tmdbImage, tmdb } from "@/lib/tmdb";
import { subscribeCustomLists, deleteCustomList } from "@/lib/firestore";
import Link from "next/link";
import { Trash2, Star, Globe, Lock, ListVideo, Tv, Eye } from "lucide-react";

export default function ListelerimPage() {
  const { watchlist, updateStatus, toggleWatch, stats } = useStore();
  const { user } = useAuth();
  const [active, setActive] = useState("ALL");
  const [customLists, setCustomLists] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedAnimes, setExpandedAnimes] = useState<Record<string, any[]>>({});

  const tabs: any[] = ["ALL", "WATCHING", "COMPLETED", "PLAN_TO_WATCH", "ON_HOLD", "DROPPED"];
  const labels: Record<string, string> = { ALL: "Tümü", WATCHING: "İzleniyor", COMPLETED: "Tamamlandı", PLAN_TO_WATCH: "Plan", ON_HOLD: "Beklemede", DROPPED: "Bırakıldı" };
  const filtered = active === "ALL" ? watchlist : watchlist.filter((w) => w.status === active);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeCustomLists(user.uid, (lists) => {
      setCustomLists(lists);
      const open = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("open") : null;
      if (open && lists.find((l: any) => l.id === open)) {
        setExpanded(open);
      }
    });
    return () => unsub();
  }, [user]);

  const toggleExpand = async (list: any) => {
    if (expanded === list.id) { setExpanded(null); return; }
    setExpanded(list.id);
  };

  useEffect(() => {
    if (!expanded) return;
    const list = customLists.find((l: any) => l.id === expanded);
    if (!list || expandedAnimes[expanded] || !list.animeIds?.length) return;
    (async () => {
      const ids: number[] = list.animeIds;
      const details = await Promise.all(ids.map(async (aid) => {
        try {
          let d: any = null;
          try { d = await tmdb.tvDetails(aid); d._format = "tv"; } catch { try { d = await tmdb.movieDetails(aid); d._format = "movie"; } catch {} }
          return d;
        } catch { return null; }
      }));
      setExpandedAnimes((prev) => ({ ...prev, [list.id]: details.filter(Boolean) }));
    })();
  }, [expanded, customLists]);

  if (!user) {
    return (
      <div className="m3-card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EADDFF] mx-auto flex items-center justify-center text-xl">🔒</div>
        <div className="font-bold mt-3">Listelerini görmek için giriş yap</div>
        <div className="text-sm text-[#49454F]">Takip listen ve oluşturduğun listeler burada görünecek.</div>
        <Link href="/profile" className="m3-button mt-4 inline-flex">Giriş Yap</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Takip Listem - izlediğim animeler */}
      <div className="m3-card p-6 bg-gradient-to-r from-[#6750A4] to-[#7D5260] text-white">
        <h1 className="text-2xl font-black">Takip Listem</h1>
        <p className="text-white/80 text-sm">{watchlist.length} anime • {stats.totalCompleted} tamamlandı • {stats.totalHours} saat • {stats.totalDays} gün</p>
        <p className="text-white/60 text-xs mt-1">İzlediğin animeler, bölüm takibin ve durumun burada.</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActive(t)} className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${active === t ? "bg-[#6750A4] text-white border-[#6750A4]" : "bg-white dark:bg-[#211F26] border-[#E7E0EC] dark:border-[#49454F]"}`}>{labels[t]}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="m3-card p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#EADDFF] mx-auto flex items-center justify-center"><Tv className="w-6 h-6 text-[#21005D]" /></div>
          <div className="font-bold mt-3">Takip listen boş</div>
          <div className="text-sm text-[#49454F]">Anasayfadan + ile ekle, bölüm ilerlemeni buradan takip et.</div>
          <Link href="/" className="m3-button mt-4 inline-flex">Keşfet</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <div key={e.id} className="m3-card overflow-hidden flex">
              <Link href={e.format === "MOVIE" ? `/movie?id=${e.tmdbId}` : `/anime?id=${e.tmdbId}`} className="w-28 shrink-0">
                <img src={tmdbImage.poster(e.anime.posterPath, "w185")} alt="" className="w-full h-full object-cover min-h-[168px]" />
              </Link>
              <div className="p-3 flex-1 min-w-0 flex flex-col">
                <Link href={e.format === "MOVIE" ? `/movie?id=${e.tmdbId}` : `/anime?id=${e.tmdbId}`} className="font-semibold leading-tight line-clamp-2 hover:text-[#6750A4]">{e.anime.title.english || e.anime.title.romaji}</Link>
                <div className="text-xs text-[#49454F] flex items-center gap-1.5 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${e.format === "MOVIE" ? "bg-[#FFD8E4] text-[#31111D]" : "bg-[#EADDFF] text-[#21005D]"}`}>{e.format}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{e.anime.voteAverage?.toFixed(1)}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <select value={e.status} onChange={(ev) => updateStatus(e.tmdbId, ev.target.value as any)} className="flex-1 h-8 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-2 text-xs">
                    <option value="WATCHING">İzleniyor</option><option value="COMPLETED">Tamamlandı</option><option value="PLAN_TO_WATCH">Plan</option><option value="ON_HOLD">Beklemede</option><option value="DROPPED">Bıraktım</option>
                  </select>
                  <button onClick={() => toggleWatch({ id: e.tmdbId }, e.format as "TV" | "MOVIE")} className="w-8 h-8 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {e.format === "TV" && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs">Bölüm</span>
                    <button onClick={() => updateStatus(e.tmdbId, e.status, Math.max(0, e.currentEpisode - 1))} className="w-7 h-7 rounded-full bg-[#E8DEF8] dark:bg-[#4F378B] flex items-center justify-center text-sm font-bold">−</button>
                    <span className="text-sm font-bold min-w-[24px] text-center">{e.currentEpisode}</span>
                    <button onClick={() => updateStatus(e.tmdbId, e.status, Math.min(e.totalEpisodes || 24, e.currentEpisode + 1))} disabled={e.currentEpisode >= (e.totalEpisodes || 24)} className="w-7 h-7 rounded-full bg-[#6750A4] text-white flex items-center justify-center text-sm font-bold disabled:opacity-40">+</button>
                    <span className="text-xs text-[#49454F]">/ {e.totalEpisodes || 24}</span>
                  </div>
                )}
                <div className="mt-auto pt-2">
                  <div className="h-1.5 bg-[#F3EDF7] dark:bg-[#2B2930] rounded-full overflow-hidden"><div className="h-full bg-[#6750A4]" style={{ width: `${e.status === "COMPLETED" ? 100 : e.format === "MOVIE" ? 0 : Math.min(100, (e.currentEpisode / (e.totalEpisodes || 24)) * 100)}%` }} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listelerim - custom lists */}
      <div className="m3-card p-4 lg:p-6">
        <h2 className="font-bold text-lg flex items-center gap-2"><ListVideo className="w-5 h-5 text-[#6750A4]" /> Listelerim <span className="text-xs font-normal bg-[#EADDFF] text-[#21005D] px-2 py-1 rounded-full">{customLists.length} liste</span></h2>
        <p className="text-sm text-[#49454F] dark:text-[#CAC4D0]">Kendi oluşturduğun listeler. Herkese açık olanlar keşfette görünür.</p>

        {customLists.length === 0 ? (
          <div className="mt-4 p-8 text-center rounded-2xl bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50 border border-dashed">
            <ListVideo className="w-10 h-10 mx-auto text-[#6750A4] mb-2" />
            <div className="font-semibold">Henüz listen yok</div>
            <div className="text-sm text-[#49454F]">Profilinden yeni liste oluştur, sonra anasayfadan + ile anime ekle.</div>
            <Link href="/profile" className="m3-button mt-3 inline-flex">Liste Oluştur</Link>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {customLists.map((l: any) => (
              <div key={l.id} className="rounded-2xl border border-[#E7E0EC] dark:border-[#2B2930] bg-[#F3EDF7] dark:bg-[#211F26] overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#6750A4] to-[#7D5260]" />
                <div className="p-4 flex gap-3 items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${l.isPublic ? "bg-[#EADDFF] text-[#21005D]" : "bg-white dark:bg-[#211F26] border"}`}>{l.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold leading-tight truncate">{l.title}</div>
                    <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] truncate">{l.description || "Açıklama yok"} • {l.animeIds?.length || 0} anime • {new Date(l.createdAt?.toDate?.() || l.createdAt || Date.now()).toLocaleDateString("tr-TR")}</div>
                  </div>
                  <button onClick={() => toggleExpand(l)} className="px-4 h-9 rounded-full bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] text-sm font-semibold flex items-center gap-1.5"><Eye className="w-4 h-4" />{expanded === l.id ? "Gizle" : "Görüntüle"}</button>
                  <button onClick={async () => { if (confirm("Silinsin mi?")) await deleteCustomList(l.id); }} className="w-9 h-9 rounded-full bg-white dark:bg-[#211F26] border flex items-center justify-center text-[#BA1A1A]"><Trash2 className="w-4 h-4" /></button>
                </div>
                {expanded === l.id && (
                  <div className="p-4 pt-0">
                    {expandedAnimes[l.id] ? (
                      expandedAnimes[l.id].length ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {expandedAnimes[l.id].map((a: any) => {
                            const isMovie = a._format === "movie" || !!a.title;
                            return (
                              <Link key={a.id} href={isMovie ? `/movie?id=${a.id}` : `/anime?id=${a.id}`} className="group relative rounded-xl overflow-hidden bg-white dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F]">
                                <img src={tmdbImage.poster(a.poster_path, "w342")} alt={a.name || a.title} className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                  <div className="text-white text-xs font-semibold line-clamp-2">{a.name || a.title}</div>
                                  <div className="text-white/70 text-[11px] flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{a.vote_average?.toFixed(1)}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-sm text-[#49454F]">Bu liste boş — + ile anime ekle.</div>
                      )
                    ) : (
                      <div className="py-6 text-center text-sm text-[#49454F]">Yükleniyor...</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
