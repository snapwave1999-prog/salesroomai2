// app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env
  .NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        console.error("Erreur inscription:", error);
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      console.log("Inscription OK:", data.user?.id);

      router.push("/auth/login");
    } catch (e) {
      console.error("Erreur inattendue inscription:", e);
      setErrorMsg("Erreur inattendue lors de l'inscription.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-white text-center">
          Inscription
        </h1>
        <p className="text-xs text-slate-400 text-center">
          Créez un compte pour participer aux encans.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs text-slate-300">
              Nom complet
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Ex. Bernard Tremblay"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-slate-300">
              Email
            </label>
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
              placeholder="Au moins 6 caractères"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400">{errorMsg}</p>
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
            {loading ? "Inscription..." : "Créer un compte"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="w-full rounded-md px-4 py-2 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700"
        >
          Déjà un compte ? Se connecter
        </button>
      </div>
    </main>
  );
}



