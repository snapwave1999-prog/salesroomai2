// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-white text-center">
          SalesRoomAI – Démo
        </h1>
        <p className="text-xs text-slate-400 text-center">
          Choisissez une option pour accéder à votre SalesRoom ou à l&apos;encan de test.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="w-full rounded-md px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500"
          >
            Se connecter
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/signup")}
            className="w-full rounded-md px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500"
          >
            Créer un compte
          </button>

          <button
            type="button"
            onClick={() => router.push("/salesroom-avatar")}
            className="w-full rounded-md px-4 py-2 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700"
          >
            Ouvrir la SalesRoom avatar (démo Camaro)
          </button>
        </div>
      </div>
    </main>
  );
}




































