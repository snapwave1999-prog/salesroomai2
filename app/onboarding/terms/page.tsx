"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function OnboardingTermsPage() {
  const supabase = supabaseBrowser;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("terms_accepted_at")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && profile?.terms_accepted_at) {
        router.push("/onboarding/plan");
        return;
      }

      setLoading(false);
    };

    init();
  }, [supabase, router]);

  const handleAccept = async () => {
    if (!checked) return;
    setAccepting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        terms_accepted_at: new Date().toISOString(),
        onboarding_step: 1,
      })
      .eq("id", user.id);

    setAccepting(false);

    if (error) {
      alert("Impossible d'enregistrer ton acceptation, réessaie.");
      return;
    }

    router.push("/onboarding/plan");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-xl font-semibold text-white">
          Conditions d&apos;utilisation de SalesRoomAI
        </h1>

        <div className="h-64 overflow-y-auto text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
          <p>
            SalesRoomAI fournit une plateforme technique pour créer et gérer des ventes et des encans
            en temps réel. La plateforme ne participe pas aux transactions financières et n&apos;agit
            pas comme intermédiaire commercial ou conseil juridique.
          </p>

          <p>
            En utilisant SalesRoomAI, tu confirmes que tu es autorisé à organiser des ventes et des
            encans, et que tu respectes les lois applicables dans ta région (fiscalité, protection
            du consommateur, produits réglementés, protection des données, etc.).
          </p>

          <p>
            Tu es entièrement responsable du contenu que tu publies : titres, descriptions,
            images, prix de départ, montants gagnants et conditions de vente. Tu t&apos;engages à
            ne pas vendre de produits illégaux, volés, contrefaits ou dangereux, ni à utiliser
            la plateforme pour des activités frauduleuses ou trompeuses.
          </p>

          <p>
            Tu t&apos;engages à ne pas utiliser SalesRoomAI pour diffuser du contenu haineux,
            discriminatoire, diffamatoire, harcelant, sexuel explicite, violent, ou incitant à
            la violence, ni pour publier des informations privées ou sensibles sur des tiers.
            Tout encan de ce type peut être supprimé et ton compte suspendu ou banni.
          </p>

          <p>
            Les modérateurs de SalesRoomAI ou de ton organisation peuvent fermer un encan,
            supprimer du contenu ou bannir un compte en cas de non‑respect de ces règles, de
            suspicion de fraude ou pour protéger la plateforme et ses utilisateurs.
          </p>

          <p>
            Tu es responsable de la gestion des paiements avec tes acheteurs, du suivi des
            gagnants et de la remise des biens ou services vendus. SalesRoomAI ne garantit pas
            la solvabilité des miseurs ni la bonne exécution des ventes.
          </p>

          <p>
            En cas d&apos;abus grave (exploitation, menaces, activités criminelles, escroquerie),
            les informations pertinentes pourront être transmises aux autorités compétentes,
            conformément à la loi.
          </p>

          <p>
            Ces conditions peuvent être mises à jour. Lorsque des changements importants
            sont apportés, tu seras informé et la poursuite de l&apos;utilisation de la
            plateforme vaudra acceptation des nouvelles conditions.
          </p>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-300">
          <input
            id="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-950"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor="terms">
            J&apos;ai lu et j&apos;accepte les conditions d&apos;utilisation de SalesRoomAI.
          </label>
        </div>

        <button
          type="button"
          onClick={handleAccept}
          disabled={!checked || accepting}
          className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {accepting ? "Enregistrement..." : "J’accepte et je continue"}
        </button>
      </div>
    </main>
  );
}

