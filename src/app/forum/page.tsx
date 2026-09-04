"use client";
import Forum from "@/components/Forum";
import Shoutbox from "@/components/Shoutbox";

export default function ForumPage(){
  return (
    <div className="space-y-6">
      <Forum />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 m3-card p-6">
          <h3 className="font-bold text-lg mb-2">Forum Kuralları</h3>
          <ul className="text-sm text-[#49454F] dark:text-[#CAC4D0] list-disc pl-5 space-y-1">
            <li>Spoiler içeren gönderilerde mutlaka etiket kullan.</li>
            <li>Saygılı ol, nefret söylemi yasak.</li>
            <li>Öneri isterken tür ve beklentini belirt.</li>
            <li>Haber paylaşımlarında kaynak ekle.</li>
          </ul>
        </div>
        <Shoutbox />
      </div>
    </div>
  );
}
