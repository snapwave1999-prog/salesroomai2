// app/payment-success/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const pitchId = searchParams.get("pitchId");

  // Pour l'instant, on affiche un montant statique pour ta démo BMW 2023
  const amountText = "25 000 $ (test)";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h1 className="text-2xl font-bold text-emerald-400">
          Paiement réussi
        </h1>

        <p className="text-sm text-slate-300">
          Merci pour votre achat
          {pitchId ? ` (pitch #${pitchId})` : ""}.
        </p>

        {/* Petit récap */}
        <div className="mt-3 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-md p-3 text-left space-y-1">
          <p>
            <span className="font-semibold">ID du pitch:</span>{" "}
            {pitchId ?? "inconnu"}
          </p>
          <p>
            <span className="font-semibold">Montant payé:</span>{" "}
            {amountText}
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Paiement en mode test Stripe, aucun vrai débit n&apos;a été effectué.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/room2"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700"
          >
            Retour aux SalesRooms
          </Link>

          <Link
            href="/salesroom-avatar?salesroomId=007fc1d9-5d3c-4084-92dc-9f022ebf0f01"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-indigo-50 bg-indigo-600 hover:bg-indigo-500"
          >
            Revoir la SalesRoom Avatar BMW 2023
          </Link>
        </div>
      </div>
    </main>
  );
}







