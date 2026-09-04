"use client";
import Analytics from "@/components/Analytics";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
import { useEffect, useState } from "react";
import { Share2, Settings, Award, LogIn, Save, Plus, Trash2, Lock, Globe, ListVideo, Star, Eye, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { createCustomList, subscribeCustomLists, deleteCustomList } from "@/lib/firestore";
import { tmdb, tmdbImage } from "@/lib/tmdb";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function ProfilePage(){
  const { user, watchlist, stats } = useStore();
  const { user: fbUser, appUser, updateAppUser, loading: authLoading } = useAuth() as any;
  const [authOpen,setAuthOpen]=useState(false);
  const [edit,setEdit]=useState(false);
  const [displayName,setDisplayName]=useState(appUser?.displayName||"");
  const [bio,setBio]=useState(appUser?.bio||"");
  const [avatarUrl,setAvatarUrl]=useState(appUser?.photoURL||"");
  const [bannerUrl,setBannerUrl]=useState(appUser?.bannerUrl||"");
  const [saving,setSaving]=useState(false);
  const [uploadingAvatar,setUploadingAvatar]=useState(false);
  const [uploadingBanner,setUploadingBanner]=useState(false);
  const compressImage = (file: File, maxW: number, maxH: number, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio); h = Math.round(h * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas yok"));
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Resim okunamadı"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Dosya okunamadı"));
      reader.readAsDataURL(file);
    });
  };

  // custom lists
  const [customLists,setCustomLists]=useState<any[]>([]);
  const [newTitle,setNewTitle]=useState("");
  const [newDesc,setNewDesc]=useState("");
  const [isPublic,setIsPublic]=useState(true);
  const [creating,setCreating]=useState(false);
  const [expanded,setExpanded]=useState<string|null>(null);
  const [expandedAnimes,setExpandedAnimes]=useState<Record<string, any[]>>({});

  useEffect(()=>{
    if(!fbUser) return;
    const unsub = subscribeCustomLists(fbUser.uid, setCustomLists);
    return ()=>unsub();
  },[fbUser]);

  if(authLoading){
    return <div className="m3-card p-12 text-center"><div className="w-8 h-8 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mx-auto"/><div className="text-sm text-[#49454F] mt-3">Profil yükleniyor...</div></div>;
  }
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
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0];
    if(!file || !fbUser) return;
    if(file.size > 5*1024*1024){ alert("Avatar için max 5MB"); return; }
    if(!file.type.startsWith("image/")){ alert("Sadece resim dosyası seç"); return; }
    setUploadingAvatar(true);
    try{
      // 5MB dosyayı Firestore için <800KB JPEG'e sıkıştır (1MB limit için güvenli)
      const dataUrl = await compressImage(file, 500, 500, 0.75);
      // Firestore 1MB limiti için kontrol
      if (dataUrl.length > 900*1024) {
        // daha fazla sıkıştır
        const dataUrl2 = await compressImage(file, 400, 400, 0.6);
        setAvatarUrl(dataUrl2);
      } else {
        setAvatarUrl(dataUrl);
      }
      // Arka planda Storage'a da dene (başarılı olursa URL'yi Storage URL ile değiştir)
      ref(storage, `avatars/${fbUser.uid}/${Date.now()}_${file.name}`);
      // fire-and-forget, hata olursa dataURL kalır
      uploadBytes(ref(storage, `avatars/${fbUser.uid}/${Date.now()}_${file.name}`), file).then(r=> getDownloadURL(r.ref).then(url=> setAvatarUrl(url)).catch(()=>{})).catch(()=>{});
    } catch(err:any){ alert("Yükleme hatası: "+(err.message||"Bilinmeyen")); }
    finally{ setUploadingAvatar(false); e.target.value=""; }
  };
  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0];
    if(!file || !fbUser) return;
    if(file.size > 5*1024*1024){ alert("Banner için max 5MB"); return; }
    if(!file.type.startsWith("image/")){ alert("Sadece resim dosyası seç"); return; }
    setUploadingBanner(true);
    try{
      const dataUrl = await compressImage(file, 1200, 400, 0.72);
      if (dataUrl.length > 900*1024) {
        const dataUrl2 = await compressImage(file, 1000, 350, 0.6);
        setBannerUrl(dataUrl2);
      } else {
        setBannerUrl(dataUrl);
      }
      uploadBytes(ref(storage, `banners/${fbUser.uid}/${Date.now()}_${file.name}`), file).then(r=> getDownloadURL(r.ref).then(url=> setBannerUrl(url)).catch(()=>{})).catch(()=>{});
    } catch(err:any){ alert("Yükleme hatası: "+(err.message||"Bilinmeyen")); }
    finally{ setUploadingBanner(false); e.target.value=""; }
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
  const toggleExpand = async (list:any) => {
    if (expanded === list.id) { setExpanded(null); return; }
    setExpanded(list.id);
    if (!expandedAnimes[list.id] && list.animeIds?.length) {
      const ids:number[] = list.animeIds;
      const details = await Promise.all(ids.map(async (aid)=>{
        try { let d:any=null; try{ d=await tmdb.tvDetails(aid); d._format="tv"; }catch{ try{ d=await tmdb.movieDetails(aid); d._format="movie"; }catch{}}
          return d; } catch{ return null; }
      }));
      setExpandedAnimes(prev=> ({ ...prev, [list.id]: details.filter(Boolean) }));
    }
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
              <button onClick={async()=>{
                const shareUrl = window.location.origin + "/profile?user=" + encodeURIComponent(user.username);
                const shareData = { title: `${user.displayName} • Anime Portal`, text: `${user.displayName} profiline göz at — ${user.bio}`, url: shareUrl };
                try {
                  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) { await navigator.share(shareData); return; }
                  if (navigator.share) { await navigator.share(shareData); return; }
                } catch {}
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  alert("Profil linki kopyalandı: " + shareUrl);
                } catch {
                  const ta = document.createElement("textarea");
                  ta.value = shareUrl; document.body.appendChild(ta); ta.select();
                  try { document.execCommand("copy"); alert("Profil linki kopyalandı: " + shareUrl); } catch { prompt("Linki kopyala:", shareUrl); }
                  document.body.removeChild(ta);
                }
              }} className="h-9 px-4 rounded-full bg-white text-black text-sm font-semibold inline-flex items-center gap-1.5"><Share2 className="w-4 h-4"/> Paylaş</button>
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
        <div className="m3-card p-6 space-y-5">
          <h3 className="font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-[#6750A4]"/> Profili Düzenle — Fotoğraf Yükle</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-semibold">Görünen Ad</span><input value={displayName} onChange={e=>setDisplayName(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
            <label className="block"><span className="text-xs font-semibold">Bio</span><input value={bio} onChange={e=>setBio(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border px-3 text-sm"/></label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#E7E0EC] dark:border-[#49454F] p-4 bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50">
              <div className="text-xs font-bold flex items-center gap-1.5 mb-3"><ImageIcon className="w-4 h-4 text-[#6750A4]"/> Avatar Fotoğrafı</div>
              <div className="flex gap-4 items-center">
                <img src={avatarUrl || user.avatarUrl} alt="avatar preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <label className={`inline-flex items-center gap-2 px-4 h-10 rounded-full font-semibold text-sm cursor-pointer ${uploadingAvatar ? "bg-[#E8DEF8] text-[#49454F]" : "bg-[#6750A4] text-white hover:bg-[#4F378B]"} `}>
                    <Upload className="w-4 h-4"/>{uploadingAvatar ? "Yükleniyor..." : "Dosya Seç"}
                    <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" disabled={uploadingAvatar}/>
                  </label>
                  <div className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] mt-1">PNG/JPG/WebP, max 5MB. Seçince otomatik yüklenir.</div>
                  <input value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} placeholder="veya https:// ile URL yapıştır" className="mt-2 w-full h-9 rounded-xl bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] px-3 text-xs outline-none"/>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7E0EC] dark:border-[#49454F] p-4 bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50">
              <div className="text-xs font-bold flex items-center gap-1.5 mb-3"><ImageIcon className="w-4 h-4 text-[#6750A4]"/> Banner Fotoğrafı</div>
              <div className="flex gap-4 items-center">
                <img src={bannerUrl || user.bannerUrl} alt="banner preview" className="w-24 h-16 rounded-xl object-cover border-2 border-white shadow flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <label className={`inline-flex items-center gap-2 px-4 h-10 rounded-full font-semibold text-sm cursor-pointer ${uploadingBanner ? "bg-[#E8DEF8] text-[#49454F]" : "bg-[#6750A4] text-white hover:bg-[#4F378B]"}`}>
                    <Upload className="w-4 h-4"/>{uploadingBanner ? "Yükleniyor..." : "Dosya Seç"}
                    <input type="file" accept="image/*" onChange={handleBannerFile} className="hidden" disabled={uploadingBanner}/>
                  </label>
                  <div className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] mt-1">1200×400 önerilir, max 5MB</div>
                  <input value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} placeholder="veya https:// ile URL yapıştır" className="mt-2 w-full h-9 rounded-xl bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] px-3 text-xs outline-none"/>
                </div>
              </div>
            </div>
          </div>

          <button onClick={save} disabled={saving || uploadingAvatar || uploadingBanner} className="m3-button inline-flex items-center gap-2 disabled:opacity-60"><Save className="w-4 h-4"/> {saving?"Kaydediliyor...":"Kaydet"}</button>
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
          <div className="space-y-3 mt-4">
            {customLists.map((l:any)=>(
              <div key={l.id} className="rounded-2xl overflow-hidden border border-[#E7E0EC] dark:border-[#2B2930] bg-[#F3EDF7] dark:bg-[#211F26]">
                <div className="h-1.5 bg-gradient-to-r from-[#6750A4] to-[#7D5260]"/>
                <div className="p-4 flex gap-3 items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${l.isPublic?"bg-[#EADDFF] text-[#21005D]":"bg-white dark:bg-[#211F26] border"}`}>{l.isPublic ? <Globe className="w-4 h-4"/> : <Lock className="w-4 h-4"/>}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold leading-tight truncate">{l.title}</div>
                    <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] truncate">{l.description || "Açıklama yok"} • {l.animeIds?.length||0} anime • {new Date(l.createdAt?.toDate?.() || l.createdAt || Date.now()).toLocaleDateString("tr-TR")}</div>
                  </div>
                  <button onClick={()=> toggleExpand(l)} className="px-4 h-9 rounded-full bg-white dark:bg-[#211F26] border border-[#E7E0EC] dark:border-[#49454F] text-sm font-semibold flex items-center gap-1.5"><Eye className="w-4 h-4"/>{expanded===l.id?"Gizle":"Görüntüle"}</button>
                  <button onClick={async()=>{ if(confirm("Listeyi silmek istiyor musun?")) await deleteCustomList(l.id); }} className="w-9 h-9 rounded-full bg-white dark:bg-[#211F26] border flex items-center justify-center text-[#BA1A1A]"><Trash2 className="w-4 h-4"/></button>
                </div>
                {expanded===l.id && (
                  <div className="p-4 pt-0">
                    {expandedAnimes[l.id] ? (
                      expandedAnimes[l.id].length ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {expandedAnimes[l.id].map((a:any)=>{
                            const isMovie = a._format==="movie" || !!a.title;
                            return (
                              <Link key={a.id} href={isMovie?`/movie?id=${a.id}`:`/anime?id=${a.id}`} className="group relative rounded-xl overflow-hidden bg-white dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F]">
                                <img src={tmdbImage.poster(a.poster_path,"w342")} alt={a.name||a.title} className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition"/>
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                  <div className="text-white text-xs font-semibold line-clamp-2">{a.name||a.title}</div>
                                  <div className="text-white/70 text-[11px] flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/>{a.vote_average?.toFixed(1)}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : <div className="py-6 text-center text-sm text-[#49454F]">Bu liste boş — + ile anime ekle.</div>
                    ) : <div className="py-6 text-center text-sm text-[#49454F]">Yükleniyor...</div>}
                    <div className="mt-3 flex gap-2">
                      <Link href={`/listelerim?open=${l.id}`} className="text-xs font-semibold text-[#6750A4] hover:underline">Tam sayfada aç →</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
