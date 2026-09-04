"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getThread, subscribeReplies, replyThread, likeThread } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Heart, MessageSquare, Eye, Send } from "lucide-react";
import Link from "next/link";

export default function ForumDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, appUser } = useAuth();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getThread(id as string).then((t) => { setThread(t); setLoading(false); });
    const unsub = subscribeReplies(id as string, setReplies);
    return () => unsub();
  }, [id]);

  const handleLike = async () => {
    if (!user) return alert("Giriş yap");
    await likeThread(id as string);
    setThread((prev:any)=> ({...prev, likes: (prev.likes||0)+1}));
  };
  const handleReply = async () => {
    if (!text.trim()) return;
    if (!user || !appUser) return alert("Giriş yap");
    await replyThread(id as string, appUser, text);
    setText("");
  };

  if (loading) return <div className="h-[60vh] rounded-[28px] bg-[#F3EDF7] dark:bg-[#211F26] animate-pulse"/>;
  if (!thread) return <div className="p-10 text-center">Konu bulunamadı <Link href="/forum" className="text-[#6750A4] underline">Foruma dön</Link></div>;

  return (
    <div className="m3-card overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-[#E7E0EC] dark:border-[#2B2930]">
        <button onClick={()=> router.back()} className="w-9 h-9 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] flex items-center justify-center"><ArrowLeft className="w-4 h-4"/></button>
        <div className="font-bold">Konu Detayı</div>
      </div>
      <div className="p-5">
        <div className="flex gap-3">
          <img src={thread.author?.photoURL || `https://i.pravatar.cc/150?img=12`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0"/>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-[#49454F]">@{thread.author?.username} • {thread.created}</div>
            <h1 className="text-xl font-black leading-tight mt-1">{thread.title}</h1>
            <p className="text-sm text-[#49454F] dark:text-[#CAC4D0] mt-3 whitespace-pre-wrap">{thread.content}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={handleLike} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] hover:bg-[#EADDFF] text-sm"><Heart className="w-4 h-4"/> {thread.likes||0} Beğen</button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-sm"><MessageSquare className="w-4 h-4"/> {replies.length} yanıt</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-sm"><Eye className="w-4 h-4"/> {thread.views||0}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <h3 className="font-bold">Yanıtlar</h3>
          {replies.length===0 ? <div className="p-6 text-center text-sm bg-[#F3EDF7]/50 rounded-2xl">Henüz yanıt yok</div> :
            replies.map((r:any)=>(
              <div key={r.id} className="flex gap-3 p-3 rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26]">
                <img src={r.author?.photoURL || `https://i.pravatar.cc/150?u=${r.author?.uid}`} alt="" className="w-8 h-8 rounded-full object-cover shrink-0"/>
                <div><div className="text-sm font-semibold">{r.author?.displayName}</div><div className="text-sm whitespace-pre-wrap">{r.content}</div><div className="text-xs text-[#79747E] mt-1">{new Date(r.createdAt).toLocaleString("tr-TR")}</div></div>
              </div>
            ))}
        </div>
        <div className="mt-6 flex gap-2">
          <input value={text} onChange={e=> setText(e.target.value)} placeholder="Yanıt yaz..." className="flex-1 h-11 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] border px-4 text-sm outline-none"/>
          <button onClick={handleReply} className="w-11 h-11 rounded-full bg-[#6750A4] text-white flex items-center justify-center"><Send className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
}
