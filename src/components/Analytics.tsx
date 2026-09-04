"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { Trophy, Clock, Film, Tv } from "lucide-react";
import { useStore } from "@/lib/store";

export default function Analytics() {
  const { stats, user } = useStore();
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 m3-card p-5">
        <h3 className="font-bold flex items-center gap-2 mb-4">İzleme Analitiği <span className="text-xs bg-[#EADDFF] dark:bg-[#4F378B] px-2 py-1 rounded-full">Canlı</span></h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label:"Tamamlanan", value: stats.totalCompleted, sub:"Anime + Film", icon: Trophy, color:"bg-[#EADDFF] text-[#21005D]" },
            { label:"İzleniyor", value: stats.currentlyWatching, sub:"Aktif takip", icon: Tv, color:"bg-[#E8DEF8] text-[#1D192B]" },
            { label:"Toplam Süre", value:`${stats.totalHours}h`, sub:`${stats.totalDays} gün`, icon: Clock, color:"bg-[#FFD8E4] text-[#31111D]" },
          ].map(c=>(
            <div key={c.label} className="rounded-2xl p-4 bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC]/50 dark:border-[#49454F]/30">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${c.color}`}><c.icon className="w-4 h-4"/></div>
              <div className="text-2xl font-black leading-none">{c.value}</div>
              <div className="text-xs font-semibold">{c.label}</div>
              <div className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold mb-2">Tür Dağılımı</div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.genreBreakdown} cx="50%" cy="50%" innerRadius={56} outerRadius={80} dataKey="count" nameKey="genre" stroke="none">
                    {stats.genreBreakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:16, border:"none", boxShadow:"0 8px 24px rgba(0,0,0,0.15)"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {stats.genreBreakdown.map(g=>(
                <span key={g.genre} className="inline-flex items-center gap-1.5 text-xs bg-[#F3EDF7] dark:bg-[#2B2930] px-2.5 py-1 rounded-full"><span className="w-2.5 h-2.5 rounded-full" style={{background:g.color}}/>{g.genre} {g.percentage}%</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Aylık Aktivite</div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.yearlyActivity}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:11}}/>
                  <Tooltip cursor={{fill:"rgba(103,80,164,0.08)"}}/>
                  <Bar dataKey="count" fill="#6750A4" radius={[8,8,4,4]} barSize={18}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-center text-[#49454F] dark:text-[#CAC4D0] mt-1">2026 izleme frekansı</div>
          </div>
        </div>
      </div>

      <div className="m3-card p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#EADDFF]"/>
          <div><div className="font-bold leading-none flex items-center gap-1">{user.displayName} {user.isVerified && <span className="w-4 h-4 rounded-full bg-[#6750A4] text-white text-[10px] flex items-center justify-center">✓</span>}</div><div className="text-xs text-[#49454F]">@{user.username}</div></div>
          <span className="ml-auto px-2.5 py-1 rounded-full bg-[#FFD93D] text-black text-xs font-bold">Lv.{user.level}</span>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-[#6750A4] to-[#7D5260] text-white">
          <div className="text-xs opacity-80 tracking-wide">SEVİYE & XP</div>
          <div className="flex items-baseline gap-2 mt-1"><span className="text-3xl font-black">{user.level}</span><span className="text-sm opacity-80">/ 50</span><span className="ml-auto text-sm font-bold">{user.xp.toLocaleString()} XP</span></div>
          <div className="h-2 bg-white/20 rounded-full mt-3 overflow-hidden"><div className="h-full bg-white rounded-full" style={{width:"68%"}}/></div>
          <div className="text-xs opacity-80 mt-1.5">Sonraki seviye için 1,530 XP kaldı • %68</div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold">Rozetler</div>
          {user.badges.map(b=>(
            <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC]/60 dark:border-[#49454F]/30">
              <span className="w-10 h-10 rounded-xl bg-white dark:bg-[#211F26] flex items-center justify-center text-lg">{b.icon}</span>
              <div><div className="text-sm font-semibold leading-none">{b.name}</div><div className="text-xs text-[#49454F] dark:text-[#CAC4D0]">{b.description}</div></div>
              <span className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-full ${b.rarity==="LEGENDARY"?"bg-[#FFD93D] text-black": b.rarity==="EPIC"?"bg-[#EADDFF] text-[#21005D]":"bg-[#E8DEF8] text-[#1D192B]"}`}>{b.rarity}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 flex gap-2">
          <button className="flex-1 h-10 rounded-full bg-[#6750A4] text-white text-sm font-semibold">Banner Değiştir</button>
          <button className="flex-1 h-10 rounded-full bg-[#F3EDF7] dark:bg-[#2B2930] text-sm font-medium border border-[#E7E0EC] dark:border-[#49454F]">Çerçeve Seç</button>
        </div>
      </div>
    </div>
  );
}
