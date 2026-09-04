"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Users, LogIn } from "lucide-react";
import { subscribeShoutbox, sendShout } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import AuthModal from "./AuthModal";

export default function Shoutbox() {
  const { user, appUser } = useAuth();
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const unsub = subscribeShoutbox(setMsgs);
    return () => unsub();
  }, []);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs]);

  const send = async () => {
    if (!text.trim()) return;
    if (!user || !appUser) { setAuthOpen(true); return; }
    await sendShout(appUser, text);
    setText("");
  };

  return (
    <div className="m3-card flex flex-col h-[520px]">
      <div className="p-4 flex items-center justify-between border-b border-[#F3EDF7] dark:border-[#2B2930]">
        <h3 className="font-bold flex items-center gap-2">Canlı Sohbet <span className="w-2 h-2 rounded-full bg-[#6BCB77] animate-pulse" /></h3>
        <span className="inline-flex items-center gap-1.5 text-xs bg-[#E8DEF8] dark:bg-[#4F378B] px-2.5 py-1 rounded-full"><Users className="w-3.5 h-3.5" /> {msgs.length} mesaj</span>
      </div>
      <div ref={ref} className="flex-1 overflow-auto p-3 space-y-2 bg-[#FFFBFE] dark:bg-[#141218]">
        {msgs.length === 0 ? <div className="py-10 text-center text-xs text-[#49454F]">Henüz mesaj yok — ilk mesajı sen gönder!</div> :
          msgs.map((m) => (
            <div key={m.id} className="flex gap-2">
              <img src={m.avatar || `https://i.pravatar.cc/150?u=${m.uid}`} alt="" className="w-7 h-7 rounded-full shrink-0 object-cover" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5"><span className="text-xs font-bold">{m.displayName || m.user}</span><span className="text-[11px] text-[#79747E]">{m.time}</span></div>
                <div className="text-sm bg-[#F3EDF7] dark:bg-[#211F26] rounded-2xl rounded-tl-sm px-3 py-1.5 inline-block max-w-[220px] break-words">{m.text}</div>
              </div>
            </div>
          ))}
      </div>
      <div className="p-3 border-t border-[#F3EDF7] dark:border-[#2B2930] flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={user ? "Mesaj yaz..." : "Giriş yap ve yaz..."} className="flex-1 h-10 rounded-full bg-[#F3EDF7] dark:bg-[#211F26] px-4 text-sm outline-none border border-transparent focus:border-[#6750A4]" />
        {user ? (
          <button onClick={send} className="w-10 h-10 rounded-full bg-[#6750A4] text-white flex items-center justify-center shrink-0"><Send className="w-4 h-4" /></button>
        ) : (
          <button onClick={() => setAuthOpen(true)} className="px-4 h-10 rounded-full bg-[#6750A4] text-white text-sm font-semibold inline-flex items-center gap-1.5"><LogIn className="w-4 h-4" /> Giriş</button>
        )}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
