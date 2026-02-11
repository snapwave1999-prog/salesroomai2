// app/onboarding/plan/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

type PlanOption = {
  key: "free" | "pro" | "premium";
  name: string;
  description: string;
};

const PLANS: PlanOption[] = [
  {
    key: "free",
    name: "Free",
    description: "Plan gratuit pour tester SalesRoomAI.",
  },
  {
    key: "pro",
    name: "Pro",
    description: "Pour un usage régulier avec plus de fonctionnalités.",
  },
  {
    key: "premium",
    name: "Premium",
    description: "Pour un usage intensif et équipe.",
  },
];

export default function OnboardingPlanPage() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlanOption | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("terms_accepted_at, plan_key")
        .eq("id", user.id)
        .maybeSingle();

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
  }, [router, supabase]);

  async function handleChoosePlan(plan: PlanOption) {
    setSelected(plan);
    setSaving(true);
    setError(null);

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
        plan_key: plan.key,
        onboarding_step: 2,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setError("Impossible d'enregistrer le plan. Réessaie.");
      return;
    }

    router.push("/salesrooms");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-xl font-semibold text-white text-center">
          Choisis ton plan
        </h1>
        <p className="text-sm text-slate-300 text-center">
          Tu peux changer de plan plus tard dans les paramètres.
        </p>

        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <button
              key={plan.key}
              type="button"
              onClick={() => handleChoosePlan(plan)}
              disabled={saving}
              className={`rounded-xl border p-4 text-left text-sm ${
                selected?.key === plan.key
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
              }`}
            >
              <div className="font-semibold text-white mb-1">
                {plan.name}
              </div>
              <div className="text-xs text-slate-300">
                {plan.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}



