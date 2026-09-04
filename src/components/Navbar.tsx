"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, User, Compass, CalendarDays, MessageSquare, ListVideo, Sparkles, Moon, Sun, Monitor, Menu, X, Film, Tv, LogOut, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { tmdb } from "@/lib/tmdb";
import AuthModal from "./AuthModal";

const nav = [
  { href:"/", label:"Keşfet", icon: Compass },
  { href:"/discover", label:"Ara", icon: Search },
  { href:"/calendar", label:"Yayın Akışı", icon: CalendarDays },
  { href:"/forum", label:"Topluluk", icon: MessageSquare },
  { href:"/watchlist", label:"Listem", icon: ListVideo },
  { href:"/profile", label:"Profil", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, notifications, markAllRead } = useStore();
  const { user: fbUser, appUser, logout, loading: authLoading } = useAuth();
  const [q,setQ]=useState("");
  const [showNotif,setShowNotif]=useState(false);
  const [mobile,setMobile]=useState(false);
  const [results,setResults]=useState<any[]>([]);
  const [showSearch,setShowSearch]=useState(false);
  const [authOpen,setAuthOpen]=useState(false);
  const [showUserMenu,setShowUserMenu]=useState(false);

  useEffect(()=>{
    if(!q.trim()) { setResults([]); return; }
    const t = setTimeout(async()=>{
      try{ const d = await tmdb.searchMulti(q); setResults(d.results.slice(0,6)); setShowSearch(true);}catch{}
    },350);
    return ()=>clearTimeout(t);
  },[q]);

  const unread = notifications.filter(n=>!n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#FFFBFE]/85 dark:bg-[#141218]/85 border-b border-[#E7E0EC] dark:border-[#2B2930]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-[64px] flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#6750A4] flex items-center justify-center text-white font-black text-[11px] leading-none">A<span className="text-[#D0BCFF]">P</span></div>
            <div className="hidden sm:block">
              <div className="font-black tracking-tight leading-none text-[16px]">ANIME PORTAL</div>
              <div className="text-[10px] tracking-[0.18em] text-[#6750A4] dark:text-[#D0BCFF] font-semibold -mt-0.5">TV • MOVIE • UNIVERSE</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {nav.map(i=>{
              const active = pathname===i.href;
              return <Link key={i.href} href={i.href} className={`px-3.5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition ${active ? "bg-[#E8DEF8] dark:bg-[#4F378B] text-[#21005D] dark:text-white" : "hover:bg-[#F3EDF7] dark:hover:bg-[#211F26] text-[#49454F] dark:text-[#CAC4D0]"}`}>
                <i.icon className="w-4 h-4"/>{i.label}
              </Link>
            })}
          </nav>

          <div className="flex-1 max-w-[560px] ml-auto relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454F]" />
            <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>q&&setShowSearch(true)} onBlur={()=>setTimeout(()=>setShowSearch(false),200)} placeholder="Anime, film ara... (örn: Jujutsu Kaisen, Spirited Away)" className="w-full h-10 pl-10 pr-4 bg-[#F3EDF7] dark:bg-[#211F26] border border-transparent focus:border-[#6750A4] focus:bg-white dark:focus:bg-[#2B2930] rounded-full text-sm outline-none transition placeholder:text-[#49454F]/70"/>
            {showSearch && results.length>0 && (
              <div className="absolute top-[46px] left-0 right-0 bg-white dark:bg-[#211F26] rounded-2xl shadow-m3-3 border border-[#E7E0EC] dark:border-[#49454F] overflow-hidden p-2">
                {results.map((r:any)=>(
                  <button key={r.id+r.media_type} onClick={()=>{ setShowSearch(false); setQ(""); router.push(r.media_type==="movie"?`/movie/${r.id}`:`/anime/${r.id}`)}} className="w-full flex gap-3 p-2 hover:bg-[#F3EDF7] dark:hover:bg-[#2B2930] rounded-xl text-left">
                    <img src={r.poster_path?`https://image.tmdb.org/t/p/w92${r.poster_path}`:"https://via.placeholder.com/92x138/6750A4/FFF?text=?"} alt="" className="w-10 h-[56px] object-cover rounded-lg"/>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight truncate">{r.title||r.name}</div>
                      <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] flex items-center gap-1.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.media_type==="movie"?"bg-[#FFD8E4] text-[#31111D]":"bg-[#EADDFF] text-[#21005D]"}`}>{r.media_type==="movie"?"MOVIE":"TV"}</span> { (r.release_date||r.first_air_date||"").slice(0,4)} • ★ {r.vote_average?.toFixed(1)}</div>
                      <div className="text-xs line-clamp-1 text-[#49454F]/80">{r.overview}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button onClick={()=>router.push('/discover?random=1')} className="hidden sm:inline-flex items-center gap-2 px-4 h-10 rounded-full bg-[#6750A4] text-white text-sm font-medium hover:bg-[#4F378B] transition"><Sparkles className="w-4 h-4"/> Surprise Me</button>

            <div className="hidden sm:flex items-center bg-[#F3EDF7] dark:bg-[#211F26] rounded-full p-1">
              {([
                ["light", Sun],[ "dark", Moon],[ "oled", Monitor]
              ] as const).map(([v,Icon])=>(
                <button key={v} onClick={()=>setTheme(v as any)} className={`w-8 h-8 rounded-full flex items-center justify-center ${theme===v?"bg-white dark:bg-[#4F378B] shadow text-[#6750A4] dark:text-white":"text-[#49454F]"}`} title={v}><Icon className="w-4 h-4"/></button>
              ))}
            </div>

            <div className="relative">
              <button onClick={()=>{ setShowNotif(!showNotif); if(!showNotif) markAllRead(); }} className="w-10 h-10 rounded-full bg-[#F3EDF7] dark:bg-[#211F26] flex items-center justify-center relative">
                <Bell className="w-5 h-5"/>
                {unread>0 && <span className="absolute -top-1 -right-1 bg-[#BA1A1A] text-white text-[11px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{unread}</span>}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-[48px] w-[360px] bg-white dark:bg-[#211F26] rounded-2xl shadow-m3-3 border border-[#E7E0EC] dark:border-[#49454F] overflow-hidden">
                  <div className="p-4 font-semibold flex items-center justify-between">Bildirimler <span className="text-xs font-normal text-[#49454F]">{notifications.length} yeni</span></div>
                  <div className="max-h-[380px] overflow-auto">
                    {notifications.map(n=>(
                      <div key={n.id} className={`p-3 flex gap-3 border-t border-[#F3EDF7] dark:border-[#2B2930] ${!n.isRead?"bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50":""}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.type==="TRAILER"?"bg-[#EADDFF] text-[#21005D]": n.type==="REPLY"?"bg-[#E8DEF8]":"bg-[#FFD8E4]"}`}>🔔</div>
                        <div><div className="text-sm font-medium leading-tight">{n.title}</div><div className="text-xs text-[#49454F] dark:text-[#CAC4D0]">{n.body}</div><div className="text-[11px] text-[#79747E] mt-1">{new Date(n.createdAt).toLocaleString("tr-TR")}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!authLoading && (
              fbUser ? (
                <div className="relative hidden sm:block">
                  <button onClick={()=>setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 pl-1 pr-3 h-10 rounded-full bg-[#F3EDF7] dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F]">
                    <img src={appUser?.photoURL || fbUser.photoURL || `https://i.pravatar.cc/300?u=${fbUser.uid}`} alt="avatar" className="w-8 h-8 rounded-full object-cover"/>
                    <span className="text-sm font-medium max-w-[90px] truncate">{appUser?.displayName || fbUser.displayName || fbUser.email?.split("@")[0]}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-[44px] w-[260px] bg-white dark:bg-[#211F26] rounded-2xl shadow-m3-3 border border-[#E7E0EC] dark:border-[#49454F] overflow-hidden p-2">
                      <div className="p-3 flex gap-3 border-b border-[#F3EDF7] dark:border-[#2B2930] mb-2">
                        <img src={appUser?.photoURL || fbUser.photoURL || `https://i.pravatar.cc/300?u=${fbUser.uid}`} alt="" className="w-10 h-10 rounded-full"/>
                        <div><div className="text-sm font-bold leading-none">{appUser?.displayName}</div><div className="text-xs text-[#49454F]">@{appUser?.username}</div><div className="text-[11px] text-[#79747E]">{fbUser.email}</div></div>
                      </div>
                      <Link href="/profile" onClick={()=>setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F3EDF7] dark:hover:bg-[#2B2930] text-sm"><User className="w-4 h-4"/> Profil</Link>
                      <Link href="/watchlist" onClick={()=>setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F3EDF7] dark:hover:bg-[#2B2930] text-sm"><ListVideo className="w-4 h-4"/> Listem</Link>
                      <button onClick={async()=>{ await logout(); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FFD8E4] text-sm text-[#BA1A1A]"><LogOut className="w-4 h-4"/> Çıkış Yap</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={()=>setAuthOpen(true)} className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-full bg-[#6750A4] text-white text-sm font-semibold hover:bg-[#4F378B]"><LogIn className="w-4 h-4"/> Giriş Yap</button>
              )
            )}

            <button onClick={()=>setMobile(!mobile)} className="lg:hidden w-10 h-10 rounded-full bg-[#F3EDF7] dark:bg-[#211F26] flex items-center justify-center">{mobile?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
          </div>
        </div>
        {mobile && (
          <div className="lg:hidden border-t border-[#E7E0EC] dark:border-[#2B2930] bg-white dark:bg-[#141218] p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454F]"/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ara..." className="w-full h-11 pl-10 pr-4 bg-[#F3EDF7] dark:bg-[#211F26] rounded-full text-sm outline-none"/>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {nav.map(i=> <Link key={i.href} href={i.href} onClick={()=>setMobile(false)} className={`p-3 rounded-2xl flex flex-col items-center gap-1 text-xs font-medium ${pathname===i.href?"bg-[#6750A4] text-white":"bg-[#F3EDF7] dark:bg-[#211F26]"}`}><i.icon className="w-5 h-5"/>{i.label}</Link>)}
            </div>
            <div className="mt-3">
              {!fbUser ? (
                <button onClick={()=>{ setAuthOpen(true); setMobile(false); }} className="w-full h-11 rounded-full bg-[#6750A4] text-white font-semibold flex items-center justify-center gap-2"><LogIn className="w-4 h-4"/> Giriş Yap / Kayıt Ol</button>
              ) : (
                <button onClick={()=>{ logout(); setMobile(false); }} className="w-full h-11 rounded-full bg-[#F3EDF7] dark:bg-[#211F26] border font-medium flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/> Çıkış Yap ({fbUser.email})</button>
              )}
            </div>
          </div>
        )}
      </header>
      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} />
    </>
  );
}
