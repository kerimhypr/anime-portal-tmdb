"use client";
import Analytics from "@/components/Analytics";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
import { useEffect, useState } from "react";
import { Share2, Settings, Award, LogIn, Save, Plus, Trash2, Lock, Globe, ListVideo } from "lucide-react";
import Link from "next/link";
import { createCustomList, subscribeCustomLists, deleteCustomList } from "@/lib/firestore";

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

  // custom lists
  const [customLists,setCustomLists]=useState<any[]>([]);
  const [newTitle,setNewTitle]=useState("");
  const [newDesc,setNewDesc]=useState("");
  const [isPublic,setIsPublic]=useState(true);
  const [creating,setCreating]=useState(false);

  useEffect(()=>{
    if(!fbUser) return;
    const unsub = subscribeCustomLists(fbUser.uid, setCustomLists);
    return ()=>unsub();
  },[fbUser]);

  if(!fbUser){
    return (
      <div className="m3-card p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EADDFF] mx-auto flex items-center justify-center text-2xl">🔒</div>
        <div className="font-bold text-lg mt-3">Profil için giriş yap</div>
        <div className="text-sm text-[#49454F] max-w-md mx-auto">Giriş yap, profilini düzenle, kendi listelerini oluştur ve takip et.</div>
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

  const handleCreateList = async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!newTitle.trim()) return;
    setCreating(true);
    try{
      await createCustomList(fbUser.uid, newTitle, newDesc, isPublic);
      setNewTitle(""); setNewDesc("");
    }catch(err:any){ alert(err.message); }
    finally{ setCreating(false); }
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
              <button onClick={()=>{ if(navigator.share) navigator.share({title:user.displayName, url:window.location.href}); else { navigator.clipboard.writeText(window.location.href); alert("Link kopyalandı"); } }} className="h-9 px-4 rounded-full bg-white text-black text-sm font-semibold inline-flex items-center gap-1.5"><Share2 className="w-4 h-4"/> Paylaş</button>
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
          <h3 className="font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-[#6750A4]"/> Profili Düzenle</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-semibold">Görünen Ad</span><input value={displayName} onChange={e=>setDisplayName(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
            <label className="block"><span className="text-xs font-semibold">Avatar URL</span><input value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
            <label className="block"><span className="text-xs font-semibold">Banner URL</span><input value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
            <label className="block"><span className="text-xs font-semibold">Bio</span><input value={bio} onChange={e=>setBio(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
          </div>
          <button onClick={save} disabled={saving} className="m3-button inline-flex items-center gap-2 disabled:opacity-60"><Save className="w-4 h-4"/> {saving?"Kaydediliyor...":"Kaydet"}</button>
        </div>
      )}

      <Analytics />

      <div className="m3-card p-4 lg:p-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><Award className="w-5 h-5 text-[#6750A4]"/> Listelerim <span className="text-xs font-normal bg-[#EADDFF] text-[#21005D] px-2 py-1 rounded-full">{customLists.length} liste</span></h3>
        
        <form onSubmit={handleCreateList} className="mt-4 p-4 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F]">
          <div className="font-semibold text-sm mb-3 flex items-center gap-2"><Plus className="w-4 h-4"/> Yeni Liste Oluştur</div>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} required placeholder="Liste başlığı (örn: En iyi Isekai 2026)" className="h-11 rounded-xl px-4 bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] text-sm outline-none focus:border-[#6750A4]"/>
            <input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Açıklama (opsiyonel)" className="h-11 rounded-xl px-4 bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] text-sm outline-none"/>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} className="accent-[#6750A4]" />
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isPublic?"bg-[#EADDFF] text-[#21005D]":"bg-white dark:bg-[#211F26] border"}`}>{isPublic ? <><Globe className="w-3 h-3"/> Herkese Açık</> : <><Lock className="w-3 h-3"/> Gizli</>}</span>
            </label>
            <button disabled={creating} className="ml-auto m3-button h-10 disabled:opacity-60">{creating?"Oluşturuluyor...":"Oluştur"}</button>
          </div>
        </form>

        {customLists.length===0 ? (
          <div className="mt-4 p-8 text-center rounded-2xl bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50 border border-dashed border-[#79747E]/30">
            <ListVideo className="w-10 h-10 mx-auto text-[#6750A4] mb-2"/>
            <div className="font-semibold">Henüz listen yok</div>
            <div className="text-sm text-[#49454F] dark:text-[#CAC4D0] max-w-md mx-auto">Yukarıdaki formdan ilk listeni oluştur. Listelerine anime eklemek için herhangi bir anime kartındaki <span className="font-bold">+</span> ile listeye ekle, sonra profilinden yönet.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {customLists.map((l:any)=>(
              <div key={l.id} className="rounded-2xl overflow-hidden border border-[#E7E0EC] dark:border-[#2B2930] bg-[#F3EDF7] dark:bg-[#211F26] flex flex-col">
                <div className="h-2 bg-gradient-to-r from-[#6750A4] to-[#7D5260]"/>
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold leading-tight line-clamp-2">{l.title}</div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${l.isPublic?"bg-[#EADDFF] text-[#21005D]":"bg-white dark:bg-[#211F26] border"}`}>{l.isPublic ? <Globe className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}{l.isPublic?"Açık":"Gizli"}</span>
                  </div>
                  <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] mt-1 line-clamp-2">{l.description || "Açıklama yok"}</div>
                  <div className="text-xs text-[#49454F] mt-2">{l.animeIds?.length||0} anime • {new Date(l.createdAt).toLocaleDateString("tr-TR")}</div>
                </div>
                <div className="p-3 pt-0 flex gap-2">
                  <Link href={`/lists/${l.id}`} className="flex-1 h-8 rounded-full bg-[#6750A4] text-white text-xs font-semibold flex items-center justify-center">Görüntüle</Link>
                  <button onClick={async()=>{ if(confirm("Listeyi silmek istiyor musun?")) await deleteCustomList(l.id); }} className="w-8 h-8 rounded-full bg-white dark:bg-[#211F26] border flex items-center justify-center text-[#BA1A1A]"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
