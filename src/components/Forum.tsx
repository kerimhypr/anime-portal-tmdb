"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Pin, Eye, Heart, Search, Plus, ArrowLeft, Send, Trash2 } from "lucide-react";
import { subscribeThreads, createThread, subscribeReplies, replyThread, likeThread, getThread } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import AuthModal from "./AuthModal";

const TAGS: Record<string, string> = { GENERAL: "Genel", SPOILERS: "Spoiler", RECOMMENDATIONS: "Öneri", NEWS: "Haber", THEORY: "Teori", EPISODE: "Bölüm" };

export default function Forum() {
  const { user, appUser } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [active, setActive] = useState("ALL");
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("GENERAL");
  const [authOpen, setAuthOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const unsub = subscribeThreads(setThreads);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const unsub = subscribeReplies(selected.id, setReplies);
    return () => unsub();
  }, [selected]);

  const filtered = threads.filter((t) => (active === "ALL" || t.tag === active) && t.title?.toLowerCase().includes(query.toLowerCase()));
  const display = filtered;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appUser) { setAuthOpen(true); return; }
    if (!title.trim() || !content.trim()) return;
    await createThread(appUser, title, content, tag);
    setTitle(""); setContent(""); setShowNew(false);
  };

  const handleLike = async (thread: any) => {
    if (!user) { setAuthOpen(true); return; }
    if (liking) return;
    setLiking(true);
    try { await likeThread(thread.id); } catch (e:any){ alert(e.message); }
    finally { setLiking(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (!user || !appUser) { setAuthOpen(true); return; }
    if (!selected) return;
    await replyThread(selected.id, appUser, replyText);
    setReplyText("");
  };

  const openThread = async (t:any) => {
    try {
      const fresh = await getThread(t.id);
      setSelected(fresh || t);
      // push URL for shareable link without full navigation (keeps SPA)
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", `/forum/${t.id}`);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e:any){
      setSelected(t);
    }
  };
  const closeThread = () => {
    setSelected(null);
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/forum/")) {
      window.history.pushState({}, "", "/forum");
    }
  };

  if (selected) {
    return (
      <div className="m3-card overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-[#E7E0EC] dark:border-[#2B2930]">
          <button onClick={closeThread} className="w-9 h-9 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] flex items-center justify-center"><ArrowLeft className="w-4 h-4"/></button>
          <div className="font-bold">Konuya Dön</div>
          <a href={`/forum/${selected.id}`} onClick={(e)=> e.preventDefault()} className="ml-auto text-xs text-[#6750A4] underline hidden">Paylaş</a>
        </div>
        <div className="p-5">
          <div className="flex gap-3">
            <img src={selected.author?.photoURL || `https://i.pravatar.cc/150?img=12`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0"/>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${selected.tag==="SPOILERS"?"bg-[#BA1A1A] text-white": selected.tag==="THEORY"?"bg-[#6750A4] text-white":"bg-[#F3EDF7] dark:bg-[#2B2930]"}`}>{TAGS[selected.tag]||selected.tag}</span>
                <span className="text-xs text-[#49454F]">@{selected.author?.username} • {selected.created}</span>
              </div>
              <h2 className="text-xl font-black leading-tight mt-2">{selected.title}</h2>
              <p className="text-sm text-[#49454F] dark:text-[#CAC4D0] mt-3 whitespace-pre-wrap leading-relaxed">{selected.content}</p>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={()=> handleLike(selected)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] hover:bg-[#EADDFF] text-sm font-medium"><Heart className="w-4 h-4"/> {selected.likes||0} Beğen</button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-sm"><MessageSquare className="w-4 h-4"/> {replies.length} yanıt</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-sm"><Eye className="w-4 h-4"/> {selected.views||0}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-bold flex items-center gap-2">Yanıtlar <span className="text-xs font-normal bg-[#E8DEF8] px-2 py-1 rounded-full">{replies.length}</span></h3>
            {replies.length===0 ? <div className="p-6 text-center text-sm text-[#49454F] bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50 rounded-2xl">Henüz yanıt yok — ilk yanıtı sen yaz!</div> :
              replies.map((r:any)=>(
                <div key={r.id} className="flex gap-3 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26] border border-[#E7E0EC]/50">
                  <img src={r.author?.photoURL || `https://i.pravatar.cc/150?u=${r.author?.uid}`} alt="" className="w-8 h-8 rounded-full shrink-0 object-cover"/>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="text-sm font-semibold">{r.author?.displayName || r.author?.username}</span><span className="text-xs text-[#79747E]">{new Date(r.createdAt).toLocaleString("tr-TR")}</span></div>
                    <div className="text-sm mt-1 whitespace-pre-wrap">{r.content}</div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 flex gap-3">
            <img src={appUser?.photoURL || user?.photoURL || `https://i.pravatar.cc/300?img=68`} alt="" className="w-8 h-8 rounded-full hidden sm:block object-cover"/>
            <div className="flex-1 flex gap-2">
              <input value={replyText} onChange={e=> setReplyText(e.target.value)} onKeyDown={e=> e.key==="Enter" && handleReply()} placeholder={user? "Yanıt yaz... birbirinize cevap verin" : "Giriş yap ve yanıt yaz..."} className="flex-1 h-11 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-4 text-sm outline-none focus:border-[#6750A4]"/>
              <button onClick={handleReply} className="w-11 h-11 rounded-full bg-[#6750A4] text-white flex items-center justify-center shrink-0"><Send className="w-4 h-4"/></button>
            </div>
          </div>
          {!user && <button onClick={()=> setAuthOpen(true)} className="mt-3 text-sm font-semibold text-[#6750A4] underline">Giriş yap ve katıl</button>}
        </div>
        <AuthModal open={authOpen} onClose={()=> setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="m3-card overflow-hidden">
      <div className="p-4 lg:p-6 bg-gradient-to-r from-[#6750A4] to-[#7D5260] text-white">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">Topluluk • Forum</h2>
        <p className="text-white/80 text-sm mt-1">Teoriler, bölüm tartışmaları ve öneriler — spoiler etiketine dikkat.</p>
      </div>

      <div className="p-4 flex flex-wrap gap-2 items-center border-b border-[#F3EDF7] dark:border-[#2B2930]">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {["ALL", "GENERAL", "SPOILERS", "RECOMMENDATIONS", "NEWS", "THEORY"].map((tg) => (
            <button key={tg} onClick={() => setActive(tg)} className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${active === tg ? "bg-[#6750A4] text-white border-[#6750A4]" : "bg-[#F3EDF7] dark:bg-[#2B2930] border-[#E7E0EC] dark:border-[#49454F]"}`}>{tg === "ALL" ? "Tümü" : TAGS[tg]}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454F]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Konu ara..." className="pl-9 pr-3 h-9 rounded-full bg-[#F3EDF7] dark:bg-[#211F26] border border-transparent focus:border-[#6750A4] text-sm outline-none w-[180px]" />
          </div>
          <button onClick={() => user ? setShowNew(!showNew) : setAuthOpen(true)} className="h-9 px-4 rounded-full bg-[#6750A4] text-white text-sm font-semibold inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> Yeni Konu</button>
        </div>
      </div>

      {showNew && (
        <form onSubmit={submit} className="p-4 bg-[#F3EDF7] dark:bg-[#2B2930] border-b border-[#E7E0EC] dark:border-[#49454F] space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Başlık... (örn: Jujutsu Kaisen 2. Sezon finali teorim)" className="w-full h-11 rounded-xl bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] px-3 text-sm outline-none focus:border-[#6750A4]" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Detaylar..." className="w-full min-h-[96px] rounded-xl bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] p-3 text-sm outline-none" />
          <div className="flex gap-2 items-center">
            <select value={tag} onChange={(e) => setTag(e.target.value)} className="h-10 rounded-full bg-white dark:bg-[#211F26] border border-[#E7E0EC] px-3 text-sm">
              <option value="GENERAL">Genel</option><option value="THEORY">Teori</option><option value="SPOILERS">Spoiler</option><option value="RECOMMENDATIONS">Öneri</option><option value="NEWS">Haber</option>
            </select>
            <button type="submit" className="ml-auto m3-button h-10">Gönder</button>
          </div>
        </form>
      )}

      <div className="divide-y divide-[#F3EDF7] dark:divide-[#2B2930]">
        {display.map((t: any) => (
          <div key={t.id} onClick={()=> openThread(t)} className={`p-4 hover:bg-[#F3EDF7]/50 dark:hover:bg-[#2B2930]/50 transition flex gap-3 cursor-pointer ${t.isPinned ? "bg-[#FFF8E1] dark:bg-[#2B2930]" : ""}`}>
            <img src={t.author?.photoURL || `https://i.pravatar.cc/150?img=${(parseInt(t.id.slice(-1)) || 5) + 10}`} alt="" className="w-9 h-9 rounded-full shrink-0 object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {t.isPinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFD93D] text-black text-[11px] font-bold"><Pin className="w-3 h-3" /> SABİTLENDİ</span>}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${t.tag === "SPOILERS" ? "bg-[#BA1A1A] text-white" : t.tag === "NEWS" ? "bg-[#EADDFF] text-[#21005D]" : t.tag === "THEORY" ? "bg-[#6750A4] text-white" : "bg-[#F3EDF7] dark:bg-[#2B2930]"}`}>{TAGS[t.tag] || t.tag}</span>
                <span className="text-xs text-[#49454F]">@{t.author?.username || t.author} • {t.created || t.createdAt?.slice?.(0,16)}</span>
              </div>
              <div onClick={()=> openThread(t)} className="font-semibold leading-tight mt-1 hover:text-[#6750A4] cursor-pointer line-clamp-2">{t.title}</div>
              <div onClick={()=> openThread(t)} className="text-xs text-[#49454F] dark:text-[#CAC4D0] line-clamp-2 mt-1 cursor-pointer">{t.content?.slice(0,120)}</div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#49454F] dark:text-[#CAC4D0]">
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {t.replies || 0} yanıt</span>
                <button onClick={(e)=>{e.stopPropagation(); handleLike(t);}} className="flex items-center gap-1 hover:text-[#6750A4]"><Heart className="w-3.5 h-3.5" /> {t.likes || 0}</button>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {(t.views || 0).toLocaleString("tr-TR")}</span>
                <button onClick={(e)=>{e.stopPropagation(); openThread(t);}} className="ml-auto px-3 py-1 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#4F378B]">Görüntüle →</button>
              </div>
            </div>
          </div>
        ))}
        {display.length === 0 && <div className="p-10 text-center text-sm text-[#49454F]">Henüz konu yok — ilk konuyu sen aç! <button onClick={() => setAuthOpen(true)} className="text-[#6750A4] font-bold underline">Giriş yap</button></div>}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
