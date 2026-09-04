"use client";
import { useEffect, useState } from "react";
import { ArrowBigUp, ArrowBigDown, MessageCircle, EyeOff, Image as ImageIcon, LogIn } from "lucide-react";
import { subscribeComments, addComment, voteComment } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import AuthModal from "./AuthModal";

function CommentItem({ c, depth = 0, onReply }: { c: any; depth?: number; onReply: (id: string) => void }) {
  const [showSpoiler, setShowSpoiler] = useState(!c.isSpoiler);
  const [voted, setVoted] = useState<null | "up" | "down">(null);
  const author = c.author || {};
  return (
    <div className={`${depth ? "ml-6 border-l-2 border-[#E7E0EC] dark:border-[#2B2930] pl-4" : ""}`}>
      <div className="flex gap-3 py-3">
        <img src={author.photoURL || author.avatarUrl || `https://i.pravatar.cc/150?img=5`} alt="" className="w-9 h-9 rounded-full shrink-0 object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{author.displayName || author.username || "Anonim"}</span>
            <span className="text-xs text-[#49454F]">@{author.username || "anon"}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E8DEF8] dark:bg-[#4F378B] text-[#21005D] dark:text-white">Lv.{author.level || 1}</span>
            <span className="text-xs text-[#79747E]">{new Date(c.createdAt).toLocaleString("tr-TR")}</span>
            {c.isSpoiler && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#BA1A1A] text-white">SPOILER</span>}
          </div>
          <div className="relative mt-1">
            <div className={`text-sm leading-relaxed bg-[#F3EDF7] dark:bg-[#211F26] rounded-2xl px-3.5 py-2.5 ${!showSpoiler ? "blur-sm select-none" : ""}`}>
              {c.content} {c.gifUrl && <img src={c.gifUrl} alt="gif" className="mt-2 rounded-xl max-h-[180px]" />}
            </div>
            {!showSpoiler && (
              <button onClick={() => setShowSpoiler(true)} className="absolute inset-0 flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5" /> Spoiler - Tıkla ve gör</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={async () => {
                if (voted === "up") return;
                await voteComment(c.id, 1, 0);
                setVoted("up");
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${voted === "up" ? "bg-[#6750A4] text-white border-[#6750A4]" : "bg-white dark:bg-[#2B2930] border-[#E7E0EC] dark:border-[#49454F]"}`}
            >
              <ArrowBigUp className="w-4 h-4" /> {c.upvotes || 0}
            </button>
            <button
              onClick={async () => {
                if (voted === "down") return;
                await voteComment(c.id, 0, 1);
                setVoted("down");
              }}
              className={`w-8 h-7 rounded-full border flex items-center justify-center ${voted === "down" ? "bg-[#BA1A1A] text-white border-[#BA1A1A]" : "bg-white dark:bg-[#2B2930] border-[#E7E0EC]"}`}
            >
              <ArrowBigDown className="w-4 h-4" />
            </button>
            <button onClick={() => onReply(c.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[#F3EDF7] dark:bg-[#2B2930] border border-transparent"><MessageCircle className="w-3.5 h-3.5" /> Yanıtla</button>
          </div>
          {c.replies?.map((r: any) => <CommentItem key={r.id} c={r} depth={depth + 1} onReply={onReply} />)}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ animeId }: { animeId: number }) {
  const { user, appUser } = useAuth();
  const [text, setText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [gif, setGif] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeComments(animeId, setComments);
    return () => unsub();
  }, [animeId]);

  const post = async () => {
    if (!text.trim()) return;
    if (!user || !appUser) { setAuthOpen(true); return; }
    setLoading(true);
    try {
      await addComment(animeId, appUser, text, isSpoiler, selectedGif || undefined, replyTo);
      setText(""); setIsSpoiler(false); setSelectedGif(null); setReplyTo(null); setGif(false);
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="m3-card p-4 lg:p-6">
      <h3 className="font-bold text-lg mb-4">Yorumlar & Tartışma <span className="text-xs font-normal bg-[#F3EDF7] dark:bg-[#2B2930] px-2 py-1 rounded-full">{comments.length} yorum</span></h3>

      <div className="flex gap-3">
        <img src={appUser?.photoURL || user?.photoURL || "https://i.pravatar.cc/150?img=68"} alt="" className="w-9 h-9 rounded-full shrink-0 hidden sm:block object-cover" />
        <div className="flex-1">
          {replyTo && <div className="mb-2 text-xs bg-[#EADDFF] dark:bg-[#4F378B] px-3 py-2 rounded-xl flex items-center justify-between">Yanıt yazılıyor <button onClick={() => setReplyTo(null)} className="font-bold">İptal ✕</button></div>}
          <div className="relative">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={user ? "Düşüncelerini paylaş... Spoiler varsa işaretlemeyi unutma!" : "Yorum yapmak için giriş yap..."} className="w-full min-h-[96px] rounded-[20px] border border-[#E7E0EC] dark:border-[#49454F] bg-[#F3EDF7] dark:bg-[#211F26] p-3.5 pr-12 text-sm outline-none focus:border-[#6750A4]" />
            <button onClick={() => setGif(!gif)} className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-white dark:bg-[#2B2930] border border-[#E7E0EC] flex items-center justify-center"><ImageIcon className="w-4 h-4" /></button>
          </div>
          {selectedGif && <div className="mt-2 p-2 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] inline-block"><img src={selectedGif} className="w-28 h-28 object-cover rounded-xl" /><button onClick={() => setSelectedGif(null)} className="block text-xs font-bold text-[#BA1A1A] mt-1">Kaldır</button></div>}
          {gif && !selectedGif && (
            <div className="mt-2 p-2 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2930] flex gap-2 overflow-x-auto">
              {[
                "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
                "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
                "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
                "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif",
              ].map((g) => <button key={g} onClick={() => { setSelectedGif(g); setGif(false); }} className="shrink-0"><img src={g} className="w-20 h-20 object-cover rounded-xl hover:scale-105 transition" /></button>)}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} className="accent-[#BA1A1A]" /> <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isSpoiler ? "bg-[#BA1A1A] text-white" : "bg-[#F3EDF7] dark:bg-[#2B2930]"}`}>Spoiler</span></label>
            {user ? (
              <button onClick={post} disabled={loading} className="ml-auto m3-button h-10 disabled:opacity-60">{loading ? "Gönderiliyor..." : replyTo ? "Yanıt Gönder" : "Gönder"}</button>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="ml-auto m3-button h-10 inline-flex items-center gap-2"><LogIn className="w-4 h-4" /> Giriş Yap ve Yorumla</button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 divide-y divide-[#F3EDF7] dark:divide-[#2B2930]">
        {comments.length === 0 ? <div className="py-8 text-center text-sm text-[#49454F]">Henüz yorum yok — ilk yorumu sen yap!</div> : comments.map((c) => <CommentItem key={c.id} c={c} onReply={setReplyTo} />)}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
