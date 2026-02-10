"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function OnboardingEntryPage() {
  const supabase = supabaseBrowser;
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("terms_accepted_at, plan_key, onboarding_step")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          onboarding_step: 0,
        });
        router.push("/onboarding/terms");
        return;
      }

      if (!profile.terms_accepted_at) {
        router.push("/onboarding/terms");
        return;
      }

      if (!profile.plan_key) {
        router.push("/onboarding/plan");
        return;
      }

      router.push("/salesrooms");
    };

    run().finally(() => setChecking(false));
  }, [supabase, router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Redirection en cours...</p>
      </main>
    );
  }

  return null;
}




