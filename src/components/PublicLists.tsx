"use client";
import { useEffect, useState } from "react";
import { subscribePublicLists } from "@/lib/firestore";
import { Globe, Heart, ListVideo } from "lucide-react";
import Link from "next/link";

export default function PublicLists() {
  const [lists, setLists] = useState<any[]>([]);
  useEffect(() => {
    const unsub = subscribePublicLists(setLists);
    return () => unsub();
  }, []);
  return (
    <section className="m3-card p-4 lg:p-6">
      <h3 className="font-bold text-lg flex items-center gap-2">Listeleri Keşfet <span className="text-xs font-normal bg-[#EADDFF] text-[#21005D] px-2 py-1 rounded-full">{lists.length} herkese açık</span></h3>
      <p className="text-sm text-[#49454F] dark:text-[#CAC4D0]">Topluluk tarafından oluşturulan herkese açık listeler.</p>
      {lists.length === 0 ? (
        <div className="mt-4 p-8 text-center rounded-2xl bg-[#F3EDF7]/50 dark:bg-[#2B2930]/50 border border-dashed border-[#79747E]/30">
          <ListVideo className="w-8 h-8 mx-auto text-[#6750A4] mb-2" />
          <div className="font-semibold text-sm">Henüz herkese açık liste yok</div>
          <div className="text-xs text-[#49454F] dark:text-[#CAC4D0]">Profilinden ilk listeni oluştur ve herkese açık yap — burada keşfedilsin.</div>
          <Link href="/profile" className="inline-flex mt-3 px-4 h-9 rounded-full bg-[#6750A4] text-white text-sm font-semibold items-center">Liste Oluştur</Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {lists.slice(0, 6).map((l: any) => (
              <div key={l.id} className="rounded-2xl overflow-hidden border border-[#E7E0EC] dark:border-[#2B2930] bg-[#F3EDF7] dark:bg-[#211F26]">
                <div className="h-1.5 bg-gradient-to-r from-[#6750A4] to-[#7D5260]" />
                <div className="p-4">
                  <div className="font-semibold leading-tight line-clamp-2 flex items-center gap-2"><ListVideo className="w-4 h-4 text-[#6750A4]" />{l.title}</div>
                  <div className="text-xs text-[#49454F] dark:text-[#CAC4D0] mt-1 line-clamp-2">{l.description || "Açıklama yok"}</div>
                  <div className="text-xs text-[#49454F] mt-2 flex items-center gap-2"><Globe className="w-3 h-3" /> Herkese açık • {l.animeIds?.length || 0} anime • {l.likes || 0} beğeni</div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/profile" className="inline-flex mt-4 text-sm font-semibold text-[#6750A4] hover:underline">Kendi listeni oluştur →</Link>
        </>
      )}
    </section>
  );
}
