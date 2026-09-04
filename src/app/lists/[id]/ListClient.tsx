"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { tmdb, tmdbImage } from "@/lib/tmdb";
import Link from "next/link";
import { ArrowLeft, Trash2, Globe, Lock, ListVideo, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function ListClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<any>(null);
  const [animeDetails, setAnimeDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, "customLists", id as string));
      if (!snap.exists()) { setLoading(false); return; }
      const data = { id: snap.id, ...snap.data() };
      setList(data);
      // fetch anime details for each id
      const ids: number[] = (data as any).animeIds || [];
      if (ids.length) {
        const details = await Promise.all(ids.map(async (aid) => {
          try {
            // try tv first, then movie
            let d: any = null;
            try { d = await tmdb.tvDetails(aid); d._format = "tv"; } catch { try { d = await tmdb.movieDetails(aid); d._format = "movie"; } catch {}}
            return d;
          } catch { return null; }
        }));
        setAnimeDetails(details.filter(Boolean));
      }
      setLoading(false);
    })();
  }, [id]);

  const isOwner = user && list && user.uid === list.userId;

  const removeFromList = async (tmdbId: number) => {
    if (!isOwner) return;
    await updateDoc(doc(db, "customLists", id as string), { animeIds: arrayRemove(tmdbId) });
    setList((prev: any) => ({ ...prev, animeIds: prev.animeIds.filter((x: number) => x !== tmdbId) }));
    setAnimeDetails((prev) => prev.filter((a) => a.id !== tmdbId));
  };

  if (loading) return <div className="h-[60vh] rounded-[28px] bg-[#F3EDF7] dark:bg-[#211F26] animate-pulse" />;
  if (!list) return <div className="p-10 text-center">Liste bulunamadı. <Link href="/profile" className="text-[#6750A4] underline">Profile dön</Link></div>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-[#6750A4] hover:underline"><ArrowLeft className="w-4 h-4"/> Geri</button>

      <div className="m3-card p-6 bg-gradient-to-r from-[#6750A4] to-[#7D5260] text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><ListVideo className="w-6 h-6"/>{list.title}</h1>
            <div className="text-white/80 text-sm mt-1">{list.description || "Açıklama yok"} • {list.animeIds?.length || 0} anime • {list.isPublic ? "Herkese açık" : "Gizli"} • {new Date(list.createdAt?.toDate?.() || list.createdAt || Date.now()).toLocaleDateString("tr-TR")}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">{list.isPublic ? <Globe className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}{list.isPublic ? "Herkese açık liste" : "Özel liste"}</div>
          </div>
          {isOwner && <span className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold">Senin listen</span>}
        </div>
      </div>

      {animeDetails.length === 0 ? (
        <div className="m3-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EADDFF] mx-auto flex items-center justify-center text-xl">📺</div>
          <div className="font-bold mt-3">Bu liste henüz boş</div>
          <div className="text-sm text-[#49454F]">Anasayfadan <span className="font-bold">+</span> ile anime ekle ve bu listeyi seç.</div>
          <Link href="/" className="m3-button mt-4 inline-flex">Keşfet</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {animeDetails.map((a: any) => {
            const isMovie = a._format === "movie" || !!a.title;
            return (
              <div key={a.id} className="m3-card overflow-hidden group">
                <Link href={isMovie ? `/movie/${a.id}` : `/anime/${a.id}`} className="block relative aspect-[2/3] overflow-hidden">
                  <img src={tmdbImage.poster(a.poster_path, "w500")} alt={a.name || a.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-2 left-2 flex gap-1.5"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isMovie ? "bg-[#FFD8E4] text-[#31111D]" : "bg-[#EADDFF] text-[#21005D]"}`}>{isMovie ? "MOVIE" : "TV"}</span></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-white font-semibold leading-tight line-clamp-2 text-sm">{a.name || a.title}</div>
                    <div className="text-white/70 text-xs flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{a.vote_average?.toFixed(1)} • {(a.first_air_date || a.release_date || "").slice(0,4)}</div>
                  </div>
                </Link>
                {isOwner && <button onClick={() => removeFromList(a.id)} className="w-full h-9 bg-[#F3EDF7] dark:bg-[#2B2930] text-[#BA1A1A] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#FFD8E4]"><Trash2 className="w-3.5 h-3.5"/> Listeden çıkar</button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
