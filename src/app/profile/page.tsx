"use client";
import Analytics from "@/components/Analytics";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
import { useState } from "react";
import { Share2, Settings, Award, LogIn, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function ProfilePage(){
  const { user, watchlist, stats } = useStore();
  const { user: fbUser, appUser, updateAppUser } = useAuth();
  const [authOpen,setAuthOpen]=useState(false);
  const [edit,setEdit]=useState(false);
  const [displayName,setDisplayName]=useState(appUser?.displayName||"");
  const [bio,setBio]=useState(appUser?.bio||"");
  const [avatarUrl,setAvatarUrl]=useState(appUser?.photoURL||"");
  const [bannerUrl,setBannerUrl]=useState(appUser?.bannerUrl||"");
  const [saving,setSaving]=useState(false);

  if(!fbUser){
    return (
      <div className="m3-card p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EADDFF] mx-auto flex items-center justify-center text-2xl">🔒</div>
        <div className="font-bold text-lg mt-3">Profil için giriş yap</div>
        <div className="text-sm text-[#49454F] max-w-md mx-auto">Gerçek Firebase Auth ile giriş yap, profilini düzenle, rozetlerini topla, watch istatistiklerin Firestore'da senkronize olsun.</div>
        <button onClick={()=>setAuthOpen(true)} className="m3-button mt-4 inline-flex items-center gap-2"><LogIn className="w-4 h-4"/> Giriş Yap / Kayıt Ol</button>
        <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} />
      </div>
    );
  }

  const save = async()=>{
    setSaving(true);
    try{
      await updateAppUser({ displayName, bio, photoURL: avatarUrl, bannerUrl });
      setEdit(false);
    }catch(e:any){ alert(e.message); }
    finally{ setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-[28px] overflow-hidden bg-[#1C1B1F] min-h-[320px]">
        <img src={edit? bannerUrl : user.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
        <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-end">
          <img src={edit? avatarUrl : user.avatarUrl} alt="" className="w-28 h-28 rounded-[24px] object-cover border-4 border-white shadow-m3-3"/>
          <div className="text-white flex-1">
            <h1 className="text-3xl font-black flex items-center gap-2">{user.displayName} <span className="text-sm font-normal bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">Lv.{user.level} • {user.xp.toLocaleString()} XP</span></h1>
            <div className="text-white/70 text-sm">@{user.username} • {user.badges.length} rozet • {stats.totalCompleted} tamamlandı • {fbUser.email}</div>
            <p className="text-white/80 text-sm mt-2 max-w-xl">{user.bio}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>{ if(navigator.share) navigator.share({title:user.displayName, url:window.location.href}); else alert("Link kopyalandı: "+window.location.href); }} className="h-9 px-4 rounded-full bg-white text-black text-sm font-semibold inline-flex items-center gap-1.5"><Share2 className="w-4 h-4"/> Paylaş</button>
              <button onClick={()=>{ setDisplayName(appUser?.displayName||""); setBio(appUser?.bio||""); setAvatarUrl(appUser?.photoURL||""); setBannerUrl(appUser?.bannerUrl||""); setEdit(!edit); }} className="h-9 px-4 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-medium inline-flex items-center gap-1.5"><Settings className="w-4 h-4"/> {edit?"İptal":"Düzenle"}</button>
            </div>
          </div>
          <div className="ml-auto hidden lg:flex gap-3">
            {[
              {k:"Tamamlanan", v: stats.totalCompleted},
              {k:"İzleniyor", v: stats.currentlyWatching},
              {k:"Gün", v: stats.totalDays},
            ].map(s=>(
              <div key={s.k} className="bg-white text-black rounded-2xl px-5 py-3 text-center min-w-[96px]"><div className="text-2xl font-black leading-none">{s.v}</div><div className="text-xs font-medium text-[#49454F]">{s.k}</div></div>
            ))}
          </div>
        </div>
      </div>

      {edit && (
        <div className="m3-card p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-[#6750A4]"/> Profili Düzenle • Firestore'a Kaydedilecek</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-semibold">Görünen Ad</span><input value={displayName} onChange={e=>setDisplayName(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
            <label className="block"><span className="text-xs font-semibold">Avatar URL</span><input value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
            <label className="block"><span className="text-xs font-semibold">Banner URL</span><input value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
            <label className="block"><span className="text-xs font-semibold">Bio</span><input value={bio} onChange={e=>setBio(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
          </div>
          <button onClick={save} disabled={saving} className="m3-button inline-flex items-center gap-2 disabled:opacity-60"><Save className="w-4 h-4"/> {saving?"Kaydediliyor...":"Kaydet • Firestore"}</button>
        </div>
      )}

      <Analytics />

      <div className="m3-card p-4 lg:p-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><Award className="w-5 h-5 text-[#6750A4]"/> Paylaşılabilir Listeler (Yakında Firestore Listeleri)</h3>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {[
            {title:"Top 10 Isekai of All Time", count:10, likes:342, cover:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"},
            {title:"Studio Ghibli Essentials", count:12, likes:892, cover:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400"},
            {title:"Cyberpunk Watchlist", count:8, likes:156, cover:"https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400"},
          ].map(l=>(
            <div key={l.title} className="rounded-2xl overflow-hidden border border-[#E7E0EC] dark:border-[#2B2930] bg-[#F3EDF7] dark:bg-[#211F26]">
              <img src={l.cover} alt="" className="w-full h-28 object-cover"/>
              <div className="p-3"><div className="font-semibold text-sm leading-tight">{l.title}</div><div className="text-xs text-[#49454F]">{l.count} anime • ❤️ {l.likes}</div><Link href="/watchlist" className="inline-flex mt-2 text-xs font-semibold text-[#6750A4]">Görüntüle →</Link></div>
            </div>
          ))}
        </div>
      </div>

      <div className="m3-card p-4 lg:p-6">
        <h3 className="font-bold">Duvar • Yakında Firestore duvar yorumları</h3>
        <div className="mt-3 flex gap-3">
          <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover"/>
          <div className="flex-1"><textarea placeholder="Bir şey yaz... (yakında Firestore)" className="w-full min-h-[72px] rounded-2xl bg-[#F3EDF7] dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] p-3 text-sm outline-none"/><button className="m3-button mt-2 h-9 opacity-60 cursor-not-allowed" title="Yakında">Gönder (yakında)</button></div>
        </div>
      </div>
    </div>
  );
}
