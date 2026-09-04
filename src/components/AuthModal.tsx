"use client";
import { useState } from "react";
import { X, Mail, Lock, User, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp, signInGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!displayName.trim()) throw new Error("Kullanıcı adı gerekli");
        await signUp(email, password, displayName);
      }
      onClose();
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (err: any) {
      setError(err?.message || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError("");
    setLoading(true);
    try {
      await signInGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Google giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[420px] bg-white dark:bg-[#211F26] rounded-[28px] shadow-m3-3 overflow-hidden">
        <div className="bg-gradient-to-r from-[#6750A4] to-[#7D5260] p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">{mode === "login" ? "Giriş Yap" : "Kayıt Ol"}</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-white/80 text-sm mt-1">Anime Portal • Hesabını oluştur, listelerini yönet</p>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="text-xs font-semibold text-[#49454F] dark:text-[#CAC4D0] flex items-center gap-1"><User className="w-3 h-3" /> Kullanıcı Adı</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required={mode === "register"} placeholder="kerimhypr" className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-3 text-sm outline-none focus:border-[#6750A4]" />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-semibold text-[#49454F] dark:text-[#CAC4D0] flex items-center gap-1"><Mail className="w-3 h-3" /> E-posta</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ornek@animeportal.com" className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-3 text-sm outline-none focus:border-[#6750A4]" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-[#49454F] dark:text-[#CAC4D0] flex items-center gap-1"><Lock className="w-3 h-3" /> Şifre</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••" className="mt-1 w-full h-11 rounded-xl bg-[#F3EDF7] dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] px-3 text-sm outline-none focus:border-[#6750A4]" />
          </label>

          {error && <div className="p-3 rounded-xl bg-[#FFD8E4] text-[#31111D] text-sm border border-[#BA1A1A]/20">{error}</div>}

          <button disabled={loading} type="submit" className="w-full h-11 rounded-full bg-[#6750A4] hover:bg-[#4F378B] text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? "Bekle..." : mode === "login" ? <><LogIn className="w-4 h-4" /> Giriş Yap</> : <><UserPlus className="w-4 h-4" /> Kayıt Ol</>}
          </button>

          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-[#E7E0EC] dark:bg-[#49454F]" />
            <span className="text-xs text-[#79747E]">veya</span>
            <div className="flex-1 h-px bg-[#E7E0EC] dark:bg-[#49454F]" />
          </div>

          <button type="button" onClick={google} disabled={loading} className="w-full h-11 rounded-full bg-white dark:bg-[#2B2930] border border-[#E7E0EC] dark:border-[#49454F] font-medium inline-flex items-center justify-center gap-2 hover:bg-[#F3EDF7]">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" /> Google ile devam et
          </button>

          <div className="text-center text-sm">
            {mode === "login" ? (
              <span> Hesabın yok mu? <button type="button" onClick={() => setMode("register")} className="font-bold text-[#6750A4] underline">Kayıt ol</button></span>
            ) : (
              <span> Zaten hesabın var mı? <button type="button" onClick={() => setMode("login")} className="font-bold text-[#6750A4] underline">Giriş yap</button></span>
            )}
          </div>

          <p className="text-[11px] text-[#79747E] text-center leading-tight">Verilerin güvenle saklanır • 7/24 senkronizasyon</p>
        </form>
      </div>
    </div>
  );
}
