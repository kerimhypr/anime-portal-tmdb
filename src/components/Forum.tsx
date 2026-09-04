"use client";
import { useEffect, useState } from "react";
import { MessageSquare, Pin, Eye, Heart, Search, Plus, LogIn } from "lucide-react";
import { subscribeThreads, createThread } from "@/lib/firestore";
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

  useEffect(() => {
    const unsub = subscribeThreads(setThreads);
    return () => unsub();
  }, []);

  const filtered = threads.filter((t) => (active === "ALL" || t.tag === active) && t.title?.toLowerCase().includes(query.toLowerCase()));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appUser) { setAuthOpen(true); return; }
    if (!title.trim() || !content.trim()) return;
    await createThread(appUser, title, content, tag);
    setTitle(""); setContent(""); setShowNew(false);
  };

  // fallback dummy if no Firestore yet
  const display = filtered.length ? filtered : (active === "ALL" && !query ? [
    { id: "t_dummy1", title: "[Teori] One Piece Final Arc - Imu'nun gerçek gücü?", tag: "THEORY", author: { username: "nico_robin" }, replies: 342, likes: 892, views: 12400, isPinned: true, created: "2 saat önce" },
    { id: "t_dummy2", title: "Jujutsu Kaisen 2. Sezon finali spoiler'lı tartışma", tag: "SPOILERS", author: { username: "gojo_fan" }, replies: 128, likes: 445, views: 5600, created: "5 saat önce" },
  ] : []);

  return (
    <div className="m3-card overflow-hidden">
      <div className="p-4 lg:p-6 bg-gradient-to-r from-[#6750A4] to-[#7D5260] text-white">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">Topluluk • Forum Hub <span className="text-xs font-normal bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">Firestore Canlı</span></h2>
        <p className="text-white/80 text-sm mt-1">Teoriler, bölüm tartışmaları, anketler ve haberler — tüm gönderiler Firestore'da saklanır.</p>
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
            <button type="submit" className="ml-auto m3-button h-10">Gönder • Firestore</button>
          </div>
        </form>
      )}

      <div className="divide-y divide-[#F3EDF7] dark:divide-[#2B2930]">
        {display.map((t: any) => (
          <div key={t.id} className={`p-4 hover:bg-[#F3EDF7]/50 dark:hover:bg-[#2B2930]/50 transition flex gap-3 ${t.isPinned ? "bg-[#FFF8E1] dark:bg-[#2B2930]" : ""}`}>
            <img src={t.author?.photoURL || `https://i.pravatar.cc/150?img=${(parseInt(t.id.slice(-1)) || 5) + 10}`} alt="" className="w-9 h-9 rounded-full shrink-0 object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {t.isPinned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFD93D] text-black text-[11px] font-bold"><Pin className="w-3 h-3" /> SABİTLENDİ</span>}
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${t.tag === "SPOILERS" ? "bg-[#BA1A1A] text-white" : t.tag === "NEWS" ? "bg-[#EADDFF] text-[#21005D]" : t.tag === "THEORY" ? "bg-[#6750A4] text-white" : "bg-[#F3EDF7] dark:bg-[#2B2930]"}`}>{TAGS[t.tag] || t.tag}</span>
                <span className="text-xs text-[#49454F]">@{t.author?.username || t.author} • {t.created || t.createdAt?.slice?.(0,16)}</span>
              </div>
              <div className="font-semibold leading-tight mt-1 hover:text-[#6750A4] cursor-pointer line-clamp-2">{t.title}</div>
              <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] line-clamp-2 mt-1">{t.content?.slice(0,120)}</div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#49454F] dark:text-[#CAC4D0]">
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {t.replies || 0} yanıt</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {t.likes || 0}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {(t.views || 0).toLocaleString("tr-TR")}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && display.length === 0 && <div className="p-10 text-center text-sm text-[#49454F]">Henüz konu yok — ilk konuyu sen aç! <button onClick={() => setAuthOpen(true)} className="text-[#6750A4] font-bold underline">Giriş yap</button></div>}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
