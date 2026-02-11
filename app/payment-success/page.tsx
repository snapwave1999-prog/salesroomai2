// app/payment-success/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-emerald-600/40 rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-emerald-400 text-center">
          Paiement réussi
        </h1>
        <p className="text-sm text-slate-200 text-center">
          Merci pour ton achat. Ton paiement a été confirmé.
        </p>

        {sessionId && (
          <p className="text-xs text-slate-400 text-center">
            ID de session Stripe : <span className="font-mono">{sessionId}</span>
          </p>
        )}

        <div className="flex justify-center">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Retour au tableau de bord
          </a>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
          <p className="text-slate-200 text-sm">Chargement de la confirmation...</p>
        </main>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}








