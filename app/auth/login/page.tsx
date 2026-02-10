// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const supabase = supabaseBrowser;

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Erreur login:", error);
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        console.log("Connecté:", data.user?.id);
        // On repart dans le flow d'onboarding
        router.push("/onboarding");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Erreur signup:", error);
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      console.log("Inscription:", data.user?.id);

      setInfoMsg(
        "Compte créé. Si la confirmation d’email est activée dans Supabase, vérifie ta boîte mail avant de te connecter."
      );
    } catch (err) {
      console.error("Erreur inattendue auth:", err);
      setErrorMsg("Erreur inattendue, réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`pb-1 border-b-2 ${
              mode === "login"
                ? "border-emerald-500 text-white"
                : "border-transparent text-slate-500"
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`pb-1 border-b-2 ${
              mode === "signup"
                ? "border-emerald-500 text-white"
                : "border-transparent text-slate-500"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <h1 className="text-xl font-bold text-white text-center">
          {mode === "login" ? "Connexion" : "Inscription"}
        </h1>
        <p className="text-xs text-slate-400 text-center">
          {mode === "login"
            ? "Connecte-toi pour gérer tes SalesRooms et tes encans."
            : "Crée ton compte pour lancer tes premières ventes et encans."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="vous@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-300">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Votre mot de passe"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 whitespace-pre-line">
              {errorMsg}
            </p>
          )}

          {infoMsg && (
            <p className="text-xs text-emerald-300 whitespace-pre-line">
              {infoMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md px-4 py-2 text-sm font-semibold text-white ${
              loading
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {loading
              ? mode === "login"
                ? "Connexion..."
                : "Création du compte..."
              : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>
        </form>
      </div>
    </main>
  );
}





