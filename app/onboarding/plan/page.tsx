// app/onboarding/plan/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type PlanOption = {
  key: "free" | "pro" | "premium";
  name: string;
  description: string;
  highlight: string;
};

const PLAN_OPTIONS: PlanOption[] = [
  {
    key: "free",
    name: "Free",
    description: "Parfait pour tester SalesRoomAI avec un petit nombre de ventes.",
    highlight: "Limité mais suffisant pour démarrer.",
  },
  {
    key: "pro",
    name: "Pro",
    description: "Pour les vendeurs qui organisent régulièrement des encans.",
    highlight: "24 $ CA / mois, plus de salles, plus d'encans.",
  },
  {
    key: "premium",
    name: "Premium",
    description: "Pour les organisations qui ont besoin de volume et de support prioritaire.",
    highlight: "39 $ CA / mois, quotas élevés et priorité produit.",
  },
];

export default function OnboardingPlanPage() {
  const supabase = supabaseBrowser;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        .select("plan_key, terms_accepted_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setLoading(false);
        return;
      }

      if (!profile?.terms_accepted_at) {
        router.push("/onboarding/terms");
        return;
      }

      if (profile.plan_key) {
        router.push("/salesrooms");
        return;
      }

      setLoading(false);
    };

    init();
  }, [supabase, router]);

  const handleChoosePlan = async (planKey: "free" | "pro" | "premium") => {
    setErrorMsg(null);
    setSavingKey(planKey);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      if (planKey === "free") {
        // Plan gratuit: on enregistre directement dans le profil et on va au dashboard
        const { error } = await supabase
          .from("profiles")
          .update({
            plan_key: planKey,
            onboarding_step: 2,
          })
          .eq("id", user.id);

        if (error) {
          console.error("Erreur update profil free:", error);
          setErrorMsg("Impossible d'enregistrer ton forfait Free, réessaie.");
          setSavingKey(null);
          return;
        }

        router.push("/salesrooms");
        return;
      }

      // Plan payant: création d'une session Stripe Checkout via notre API
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planKey }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Erreur API Stripe:", data);
        setErrorMsg("Impossible d'ouvrir la page de paiement Stripe.");
        setSavingKey(null);
        return;
      }

      const data = await res.json();
      if (!data.url) {
        setErrorMsg("Réponse Stripe invalide.");
        setSavingKey(null);
        return;
      }

      // Redirection vers Stripe
      window.location.href = data.url as string;
    } catch (err) {
      console.error("Erreur handleChoosePlan:", err);
      setErrorMsg("Erreur inattendue, réessaie.");
      setSavingKey(null);
    }
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
      <div className="max-w-3xl w-full space-y-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-2">
          <h1 className="text-xl font-semibold text-white">
            Choisis ton forfait de départ
          </h1>
          <p className="text-sm text-slate-400">
            Tu pourras changer plus tard. Commence simple, l&apos;important est de lancer tes premières ventes.
          </p>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 text-center">{errorMsg}</p>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_OPTIONS.map((plan) => (
            <button
              key={plan.key}
              type="button"
              onClick={() => handleChoosePlan(plan.key)}
              disabled={savingKey !== null}
              className={`flex flex-col justify-between rounded-2xl border px-4 py-4 text-left text-sm transition
                ${
                  plan.key === "pro"
                    ? "border-emerald-600 bg-emerald-900/20"
                    : "border-slate-800 bg-slate-900/60"
                }
                hover:border-emerald-500 hover:bg-slate-900
                disabled:opacity-60
              `}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-white">
                    {plan.name}
                  </span>
                  {plan.key === "pro" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                      Recommandé
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{plan.description}</p>
              </div>
              <div className="mt-3 text-[11px] text-emerald-300">
                {savingKey === plan.key
                  ? "Redirection en cours..."
                  : plan.highlight}
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Cette sélection sert à adapter tes quotas de SalesRooms et d&apos;encans. Tu pourras upgrader plus tard avec Stripe.
        </p>
      </div>
    </main>
  );
}


