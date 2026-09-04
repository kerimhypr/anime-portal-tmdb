"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getThread, subscribeReplies, replyThread, likeThread, likeReply } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Heart, MessageSquare, Send } from "lucide-react";
import Link from "next/link";

export default function ForumDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, appUser } = useAuth();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToName, setReplyToName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const handleLikeReply = async (replyId:string) => {
    if(!user) return alert("Giriş yap");
    await likeReply(id as string, replyId);
  };

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
    await replyThread(id as string, appUser, text, replyTo);
    setText(""); setReplyTo(null); setReplyToName(null);
  };

  if (loading) return <div className="h-[60vh] rounded-[28px] bg-[#F3EDF7] dark:bg-[#211F26] animate-pulse"/>;
  if (!thread) return <div className="p-10 text-center">Konu bulunamadı <Link href="/forum" className="text-[#6750A4] underline">Foruma dön</Link></div>;

  const topLevel = replies.filter((r:any)=> !r.parentId);
  const childrenMap = new Map<string, any[]>();
  replies.forEach((r:any)=> { if(r.parentId){ const arr=childrenMap.get(r.parentId)||[]; arr.push(r); childrenMap.set(r.parentId, arr); }});

  return (
    <div className="m3-card overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-[#E7E0EC] dark:border-[#2B2930] bg-[#F3EDF7]/30 dark:bg-[#2B2930]/30">
        <button onClick={()=> router.back()} className="w-9 h-9 rounded-full bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] flex items-center justify-center hover:bg-[#E8DEF8]"><ArrowLeft className="w-4 h-4"/></button>
        <div className="font-bold">Konu Detayı</div>
      </div>
      <div className="p-5">
        <div className="flex gap-3">
          <img src={thread.author?.photoURL || `https://i.pravatar.cc/150?img=12`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[#EADDFF]"/>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{thread.author?.displayName || thread.author?.username}</div>
            <div className="text-xs text-[#49454F]">@{thread.author?.username} • {thread.created}</div>
            <h1 className="text-xl font-black leading-tight mt-1">{thread.title}</h1>
            <p className="text-sm text-[#49454F] dark:text-[#CAC4D0] mt-3 whitespace-pre-wrap leading-relaxed">{thread.content}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={handleLike} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] hover:bg-[#EADDFF] text-sm font-medium"><Heart className="w-4 h-4"/> {thread.likes||0} Beğen</button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-sm border"><MessageSquare className="w-4 h-4"/> {replies.length} yanıt</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-bold flex items-center gap-2">Yanıtlar <span className="text-xs font-bold bg-[#6750A4] text-white px-2.5 py-1 rounded-full">{replies.length}</span></h3>
          {replies.length===0 ? <div className="mt-3 p-6 text-center text-sm bg-[#F3EDF7]/60 dark:bg-[#2B2930]/60 rounded-2xl border border-dashed">Henüz yanıt yok — ilk yanıtı sen yaz!</div> : (
            <div className="mt-3 space-y-3">
              {topLevel.map((r:any)=> (
                <div key={r.id} className="rounded-2xl bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#2B2930] overflow-hidden">
                  <div className="flex gap-3 p-4">
                    <img src={r.author?.photoURL || `https://i.pravatar.cc/150?u=${r.author?.uid}`} alt="" className="w-9 h-9 rounded-full shrink-0 object-cover border"/>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2"><span className="text-sm font-bold">{r.author?.displayName}</span><span className="text-xs bg-[#E8DEF8] dark:bg-[#4F378B] text-[#21005D] dark:text-white px-2 py-0.5 rounded-full">Lv.1</span><span className="text-xs text-[#79747E]">{new Date(r.createdAt).toLocaleString("tr-TR")}</span></div>
                      <div className="text-sm mt-1.5 leading-relaxed whitespace-pre-wrap">{r.content}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={()=> handleLikeReply(r.id)} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] hover:bg-[#EADDFF]"><Heart className="w-3 h-3"/> {r.likes||0} Beğen</button>
                        <button onClick={()=> { setReplyTo(r.id); setReplyToName(r.author?.displayName||r.author?.username); setTimeout(()=> document.getElementById("reply-input-detail")?.focus(),50);}} className="text-xs font-semibold text-[#6750A4] hover:underline inline-flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Yanıtla</button>
                      </div>
                    </div>
                  </div>
                  {(childrenMap.get(r.id)||[]).length>0 && (
                    <div className="ml-4 mr-2 mb-3 space-y-2 border-l-2 border-[#EADDFF] dark:border-[#4F378B] pl-3">
                      {(childrenMap.get(r.id)||[]).map((child:any)=> (
                          <div key={child.id} className="flex gap-2.5 p-3 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC]/40">
                            <img src={child.author?.photoURL || `https://i.pravatar.cc/150?u=${child.author?.uid}`} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover"/>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5"><span className="text-xs font-bold">{child.author?.displayName}</span><span className="text-[11px] text-[#79747E]">{new Date(child.createdAt).toLocaleString("tr-TR")}</span></div>
                              <div className="text-xs mt-1 whitespace-pre-wrap leading-relaxed"><span className="text-[#6750A4] font-semibold">@{r.author?.username} </span>{child.content}</div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <button onClick={()=> handleLikeReply(child.id)} className="text-[11px] inline-flex items-center gap-1 text-[#49454F] hover:text-[#6750A4]"><Heart className="w-3 h-3"/> {child.likes||0}</button>
                                <button onClick={()=> { setReplyTo(r.id); setReplyToName(child.author?.displayName||child.author?.username); setTimeout(()=> document.getElementById("reply-input-detail")?.focus(),50);}} className="text-[11px] font-semibold text-[#6750A4] hover:underline">Yanıtla</button>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 m3-card p-3 bg-[#F3EDF7]/50 dark:bg-[#2B2930]/30 border border-[#E7E0EC] dark:border-[#49454F]">
          {replyTo && <div className="mb-2 flex items-center justify-between text-xs bg-[#EADDFF] dark:bg-[#4F378B] text-[#21005D] dark:text-white px-3 py-1.5 rounded-full"><span>↳ <b>{replyToName}</b> kişisine yanıt</span><button onClick={()=> {setReplyTo(null); setReplyToName(null);}} className="font-bold">İptal ✕</button></div>}
          <div className="flex gap-3 items-end">
            <img src={appUser?.photoURL || user?.photoURL || `https://i.pravatar.cc/300?img=68`} alt="" className="w-9 h-9 rounded-full hidden sm:block object-cover border-2 border-white shadow shrink-0"/>
            <div className="flex-1">
              <textarea id="reply-input-detail" value={text} onChange={e=> setText(e.target.value)} rows={2} placeholder={user? (replyTo? `${replyToName} için yanıt...` : "Düşünceni yaz...") : "Giriş yap ve yanıt yaz..."} className="w-full min-h-[44px] rounded-2xl bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] px-4 py-3 text-sm outline-none focus:border-[#6750A4] focus:ring-2 focus:ring-[#EADDFF] resize-none"/>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[11px] text-[#79747E]">Yanıta yanıt verilebilir</span>
                <button onClick={handleReply} disabled={!text.trim()} className="px-5 h-9 rounded-full bg-[#6750A4] text-white text-sm font-bold hover:bg-[#4F378B] disabled:opacity-50">Gönder</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
