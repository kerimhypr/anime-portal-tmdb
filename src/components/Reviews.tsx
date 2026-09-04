"use client";
import { useEffect, useState } from "react";
import { Star, LogIn } from "lucide-react";
import { subscribeReviews, addReview, voteReview } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import AuthModal from "./AuthModal";

export default function Reviews({ animeId }: { animeId: number }) {
  const { user, appUser } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeReviews(animeId, setReviews);
    return () => unsub();
  }, [animeId]);

  const submit = async () => {
    if (!user || !appUser) { setAuthOpen(true); return; }
    if (!score) return alert("Lütfen 1-10 arası puan verin");
    if (!title.trim() || !content.trim()) return alert("Başlık ve içerik gerekli");
    setLoading(true);
    try {
      await addReview(animeId, appUser, score, title, content, isSpoiler);
      setTitle(""); setContent(""); setScore(0); setIsSpoiler(false);
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="m3-card p-4 lg:p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">İncelemeler <span className="text-xs bg-[#EADDFF] dark:bg-[#4F378B] px-2 py-1 rounded-full">1-10</span></h3>

      <div className="flex gap-2 items-center mb-3">
        <span className="text-sm font-medium">Puanın:</span>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => <button key={i} onClick={() => setScore(i + 1)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${score >= i + 1 ? "bg-[#6750A4] text-white border-[#6750A4]" : "bg-[#F3EDF7] dark:bg-[#2B2930] border-transparent"}`}>{i + 1}</button>)}
        </div>
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık (örn: Görsel şölen)" className="w-full h-11 rounded-xl border border-[#E7E0EC] dark:border-[#49454F] bg-[#F3EDF7] dark:bg-[#211F26] px-3 text-sm outline-none mb-3" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Detaylı incelemenizi yazın... (spoiler varsa belirtin)" className="w-full min-h-[110px] rounded-2xl border border-[#E7E0EC] dark:border-[#49454F] bg-[#F3EDF7] dark:bg-[#211F26] p-3 text-sm outline-none" />
      <div className="flex justify-between items-center mt-3">
        <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} className="accent-[#BA1A1A]" /> Spoiler içeriyor</label>
        {user ? (
          <button onClick={submit} disabled={loading} className="m3-button disabled:opacity-60">{loading ? "Gönderiliyor..." : "Gönder"}</button>
        ) : (
          <button onClick={() => setAuthOpen(true)} className="m3-button inline-flex items-center gap-2"><LogIn className="w-4 h-4" /> Giriş Yap ve İncele</button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {reviews.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2930] text-sm text-center text-[#49454F]">Henüz inceleme yok — ilk incelemeyi sen yaz!</div>
        ) : reviews.map((r) => (
          <div key={r.id} className="p-4 rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26] border border-[#E7E0EC]/50 dark:border-[#2B2930]">
            <div className="flex items-center gap-2"><img src={r.author?.photoURL || `https://i.pravatar.cc/150?u=${r.author?.uid}`} alt="" className="w-8 h-8 rounded-full object-cover" /><span className="text-sm font-semibold">{r.author?.displayName || r.author?.username}</span><span className="ml-auto px-2 py-1 rounded-full bg-[#6750A4] text-white text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-white" />{r.rating}/10</span></div>
            <div className="font-semibold text-sm mt-2 flex items-center gap-2">{r.title} {r.isSpoiler && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#BA1A1A] text-white">SPOILER</span>}</div>
            <div className="text-sm text-[#49454F] dark:text-[#CAC4D0]">{r.content}</div>
            <div className="text-xs text-[#79747E] mt-1">{new Date(r.createdAt).toLocaleString("tr-TR")}</div>
            <div className="flex gap-2 mt-2 text-xs">
              <button onClick={() => voteReview(r.id, true)} className="px-3 py-1 rounded-full bg-white dark:bg-[#2B2930] border hover:bg-[#EADDFF]">👍 Yardımcı ({r.helpful || 0})</button>
              <button onClick={() => voteReview(r.id, false)} className="px-3 py-1 rounded-full bg-white dark:bg-[#2B2930] border">👎 ({r.notHelpful || 0})</button>
            </div>
          </div>
        ))}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
