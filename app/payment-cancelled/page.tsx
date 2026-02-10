// app/payment-cancelled/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pitchId = searchParams.get("pitchId");

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Paiement annulé
        </h1>
        <p className="text-sm text-slate-700">
          Le paiement{pitchId ? <> pour le pitch #{pitchId}</> : null} a été annulé.
          Vous pouvez réessayer plus tard.
        </p>
        <button
          onClick={() => router.push("/salesroom-avatar")}
          className="mt-4 px-4 py-2 rounded bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800"
        >
          Retour à l'avatar
        </button>
      </div>
    </main>
  );
}
