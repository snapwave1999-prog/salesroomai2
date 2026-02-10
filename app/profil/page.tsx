// app/profil/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env
  .NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Charger l'utilisateur + son profil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          setErrorMsg("Vous devez être connecté pour voir votre profil.");
          setLoading(false);
          return;
        }

        setUserId(data.user.id);

        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileErr) {
          console.error("Erreur chargement profil:", profileErr);
          setErrorMsg("Erreur lors du chargement du profil.");
        } else if (profile) {
          setFullName(
            (profile as { full_name: string | null }).full_name ?? ""
          );
        }

        setLoading(false);
      } catch (e) {
        console.error("Erreur inattendue profil:", e);
        setErrorMsg("Erreur inattendue lors du chargement du profil.");
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMsg("Utilisateur non identifié.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", userId);

      if (error) {
        console.error("Erreur mise à jour profil:", error);
        setErrorMsg("Erreur lors de l'enregistrement du nom.");
        setSaving(false);
        return;
      }

      setSaving(false);
      router.push("/room");
    } catch (e) {
      console.error("Erreur inattendue save profil:", e);
      setErrorMsg("Erreur inattendue lors de l'enregistrement.");
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-white text-center">
          Profil
        </h1>
        <p className="text-xs text-slate-400 text-center">
          Enregistrez votre nom pour l&apos;utiliser dans les encans.
        </p>

        {loading && (
          <p className="text-xs text-slate-300">
            Chargement du profil...
          </p>
        )}

        {errorMsg && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}

        {!loading && !errorMsg && (
          <form onSubmit={handleSave} className="space-y-4">
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
                placeholder="Ex. Martin Tremblay"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full rounded-md px-4 py-2 text-sm font-semibold text-white ${
                saving
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {saving ? "Enregistrement..." : "Enregistrer le profil"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => router.push("/room")}
          className="w-full rounded-md px-4 py-2 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700"
        >
          Retour à la room
        </button>
      </div>
    </main>
  );
}
