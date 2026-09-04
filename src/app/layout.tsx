import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Anime Portal — TV Series & Movies • TMDB Powered",
  description: "Production-ready Anime Portal: TV Series & Movies, trailers, universe map, broadcast calendar, forum, watch tracker & analytics. Firestore + Auth fully functional, TMDB powered, Material You.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Anime Portal",
    description: "Anime TV Series & Movies — discover, track, discuss. Gerçek giriş, gerçek veritabanı.",
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
            <main className="max-w-[1440px] mx-auto px-4 lg:px-6 pb-10 pt-6">
              {children}
            </main>
            <footer className="border-t border-[#E7E0EC] dark:border-[#2B2930] bg-[#F3EDF7]/50 dark:bg-[#211F26]/50 mt-10">
              <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 flex flex-col md:flex-row gap-6 justify-between text-sm">
                <div>
                  <div className="font-black tracking-tight">ANIME PORTAL</div>
                  <div className="text-[#49454F] dark:text-[#CAC4D0] max-w-md mt-1">Material You • Firestore + Firebase Auth ile tam fonksiyonel • TMDB canlı veri • Sıfır dummy — tüm işlemler gerçek veritabanında. © 2026 Kerim • cizbull Firebase + anime-portal-tmdb-2026 Hosting</div>
                  <div className="text-xs text-[#79747E] mt-2">This product uses the TMDB API but is not endorsed or certified by TMDB. Auth domain: cizbull.firebaseapp.com</div>
                </div>
                <div className="flex gap-8 text-xs">
                  <div><div className="font-bold mb-2">Keşfet</div><div className="space-y-1 text-[#49454F] dark:text-[#CAC4D0]"><div>Trend</div><div>Takvim</div><div>Forum</div></div></div>
                  <div><div className="font-bold mb-2">Hesap</div><div className="space-y-1 text-[#49454F] dark:text-[#CAC4D0]"><div>Profil</div><div>Listem</div><div>Ayarlar</div></div></div>
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
