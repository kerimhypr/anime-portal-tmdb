"use client";
import { useEffect, useState } from "react";
import { X, Plus, Check, ListVideo, Lock, Globe, LogIn } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { subscribeCustomLists, addAnimeToCustomList, createCustomList } from "@/lib/firestore";
import AuthModal from "./AuthModal";

export default function AddToListModal({ open, onClose, anime, format }: { open: boolean; onClose: () => void; anime: any; format: "TV" | "MOVIE" }) {
  const { watchlist, toggleWatch } = useStore();
  const { user } = useAuth();
  const [customLists, setCustomLists] = useState<any[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const tmdbId = anime?.id;
  const inWatchlist = watchlist.some((w) => w.tmdbId === tmdbId);

  useEffect(() => {
    if (!user || !open) return;
    const unsub = subscribeCustomLists(user.uid, setCustomLists);
    return () => unsub();
  }, [user, open]);

  if (!open) return null;

  const handleToggleWatch = async () => {
    if (!anime) return;
    await toggleWatch(anime, format);
    setMsg(inWatchlist ? "Takip listesinden çıkarıldı" : "Takip listene eklendi ✓");
    setTimeout(() => setMsg(""), 2000);
  };

  const handleAddToCustom = async (listId: string) => {
    setAddingId(listId);
    setMsg("");
    try {
      await addAnimeToCustomList(listId, tmdbId);
      setMsg("Listeye eklendi ✓");
    } catch (e: any) {
      setMsg(e.message || "Hata");
    } finally {
      setAddingId(null);
      setTimeout(() => setMsg(""), 2500);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;
    setAddingId("new");
    try {
      const id = await createCustomList(user.uid, newTitle, "", true);
      await addAnimeToCustomList(id, tmdbId);
      setNewTitle("");
      setMsg("Yeni liste oluşturuldu ve eklendi ✓");
    } catch (err: any) { setMsg(err.message); }
    finally { setAddingId(null); setTimeout(()=>setMsg(""),2500); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-white dark:bg-[#211F26] rounded-[28px] shadow-m3-3 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-[#E7E0EC] dark:border-[#2B2930] flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2"><ListVideo className="w-5 h-5 text-[#6750A4]" /> Listeye Ekle</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-5 overflow-auto">
          <div className="flex gap-3 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2930]">
            <img src={anime?.poster_path ? `https://image.tmdb.org/t/p/w92${anime.poster_path}` : `https://via.placeholder.com/92x138/6750A4/FFF?text=?`} alt="" className="w-14 h-20 object-cover rounded-xl shrink-0" />
            <div><div className="font-semibold leading-tight line-clamp-2">{anime?.name || anime?.title || anime?.original_name}</div><div className="text-xs text-[#49454F] dark:text-[#CAC4D0]">{format} • TMDB #{tmdbId}</div></div>
          </div>

          {!user ? (
            <div className="p-4 rounded-2xl bg-[#EADDFF] dark:bg-[#4F378B]/30 border border-[#E7E0EC] text-center">
              <div className="font-semibold">Giriş yap ve listelerini yönet</div>
              <div className="text-sm text-[#49454F] dark:text-[#CAC4D0]">Takip listesi ve özel listelerin için hesap gerekli.</div>
              <button onClick={() => setAuthOpen(true)} className="m3-button mt-3 inline-flex items-center gap-2"><LogIn className="w-4 h-4" /> Giriş Yap</button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="text-sm font-bold">Kişisel Takip (Watch Progress)</div>
                <button onClick={handleToggleWatch} className={`w-full h-12 rounded-2xl border-2 font-semibold flex items-center justify-center gap-2 ${inWatchlist ? "bg-[#6750A4] text-white border-[#6750A4]" : "bg-white dark:bg-[#211F26] border-[#E7E0EC] dark:border-[#49454F] hover:border-[#6750A4]"}`}>
                  {inWatchlist ? <><Check className="w-5 h-5" /> Listemde — Çıkar</> : <><Plus className="w-5 h-5" /> Takip Listeme Ekle</>}
                </button>
                <div className="text-xs text-[#49454F]">Watch Progress Tracker’da bölüm takibi, puan ve durum (Watching/Completed) tutulur.</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold">Oluşturduğun Listeler</div>
                {customLists.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2930] text-center text-sm text-[#49454F]">Henüz listen yok — aşağıdan yeni liste oluştur ve bu animeyi ekle.</div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                    {customLists.map((l: any) => {
                      const already = l.animeIds?.includes(tmdbId);
                      return (
                        <div key={l.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-transparent">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${l.isPublic ? "bg-[#EADDFF] text-[#21005D]" : "bg-white dark:bg-[#211F26] border"}`}>{l.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</div>
                          <div className="min-w-0 flex-1"><div className="text-sm font-semibold leading-tight truncate">{l.title}</div><div className="text-xs text-[#49454F] truncate">{l.animeIds?.length || 0} anime • {l.isPublic ? "Herkese açık" : "Gizli"}</div></div>
                          <button disabled={already || addingId === l.id} onClick={() => handleAddToCustom(l.id)} className={`px-3 h-8 rounded-full text-xs font-bold shrink-0 ${already ? "bg-[#E8DEF8] text-[#49454F] cursor-not-allowed" : "bg-[#6750A4] text-white hover:bg-[#4F378B]"}`}>
                            {already ? "Eklendi" : addingId === l.id ? "..." : "Ekle"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <form onSubmit={handleCreateAndAdd} className="flex gap-2 mt-3">
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Yeni liste başlığı (örn: Isekai Favorilerim)" className="flex-1 h-10 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-4 text-sm outline-none focus:border-[#6750A4]" />
                  <button disabled={addingId === "new" || !newTitle.trim()} className="px-4 h-10 rounded-full bg-[#6750A4] text-white text-sm font-semibold disabled:opacity-50">Oluştur & Ekle</button>
                </form>
              </div>
            </>
          )}

          {msg && <div className="p-3 rounded-xl bg-[#E8DEF8] dark:bg-[#4F378B] text-[#21005D] dark:text-white text-sm text-center font-medium">{msg}</div>}
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
