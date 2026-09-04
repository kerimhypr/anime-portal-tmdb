"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WatchlistPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/listelerim"); }, [router]);
  return (
    <div className="p-12 text-center">
      <div className="w-12 h-12 rounded-full bg-[#EADDFF] mx-auto flex items-center justify-center animate-pulse">↗</div>
      <div className="font-semibold mt-3">Listelerim’e yönlendiriliyor...</div>
      <a href="/listelerim" className="text-sm text-[#6750A4] underline">Tıkla ve git</a>
    </div>
  );
}
