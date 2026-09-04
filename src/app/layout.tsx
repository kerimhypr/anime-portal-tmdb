import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import RouteFixer from "@/components/RouteFixer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Anime Portal — TV Series & Movies • TMDB Powered",
  description: "Anime Portal: TV Series & Movies, trailers, universe map, broadcast calendar, forum, watch tracker & analytics. TMDB powered, Material You.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Anime Portal",
    description: "Anime TV Series & Movies — discover, track, discuss.",
    type: "website",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrains.variable} font-sans min-h-screen`}>
        <AuthProvider>
          <StoreProvider>
            <Navbar />
            <RouteFixer />
            <main className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-10 pt-6">
              {children}
            </main>
            <footer className="border-t border-[#E7E0EC] dark:border-[#2B2930] bg-[#F3EDF7]/50 dark:bg-[#211F26]/50 mt-10">
              <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 flex flex-col md:flex-row gap-6 justify-between text-sm">
                <div>
                  <div className="font-black tracking-tight">ANIME PORTAL</div>
                  <div className="text-[#49454F] dark:text-[#CAC4D0] max-w-md mt-1">TMDB destekli Anime platformu • Sadece Anime TV ve Filmler</div>
                  <div className="text-xs text-[#79747E] mt-1">This product uses the TMDB API but is not endorsed or certified by TMDB.</div>
                </div>
                <div className="flex gap-8 text-xs">
                  <div><div className="font-bold mb-2">Keşfet</div><div className="space-y-1 text-[#49454F] dark:text-[#CAC4D0]"><div>Trend</div><div>Takvim</div><div>Forum</div></div></div>
                  <div><div className="font-bold mb-2">Hesap</div><div className="space-y-1 text-[#49454F] dark:text-[#CAC4D0]"><div>Profil</div><div>Takip Listem</div><div>Listelerim</div></div></div>
                  <div><div className="font-bold mb-2">Destek</div><div className="space-y-1 text-[#49454F] dark:text-[#CAC4D0]"><div>İçerik İsteği</div><div>Bildir</div><div>Gizlilik</div></div></div>
                </div>
              </div>
            </footer>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
