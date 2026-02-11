

// app/payment-cancelled/page.tsx

export const dynamic = "force-static";

export default function PaymentCancelledPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
        <h1 className="text-xl font-bold text-white">
          Paiement annulé
        </h1>
        <p className="text-sm text-slate-300">
          Le paiement a été annulé ou n&apos;a pas pu être complété.
        </p>
        <p className="text-xs text-slate-400">
          Si vous pensez que c&apos;est une erreur, vous pouvez réessayer le paiement
          depuis votre SalesRoom ou contacter le support.
        </p>
        <a
          href="/"
          className="inline-block mt-4 rounded-md px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </main>
  );
}
