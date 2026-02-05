// app/auth/sign-up/page.tsx

import Link from "next/link";
import { signUp } from "../actions";

export const dynamic = "force-dynamic";

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { error?: string; info?: string };
}) {
  const error = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";
  const info = searchParams?.info
    ? decodeURIComponent(searchParams.info)
    : "";

  return (
    <main className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Créer un compte</h1>

      {error && (
        <p className="text-sm text-red-600 border border-red-300 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {info && (
        <p className="text-sm text-green-700 border border-green-300 bg-green-50 p-2 rounded">
          {info}
        </p>
      )}

      <form action={signUp} className="space-y-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="border rounded px-2 py-1"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          S&apos;inscrire
        </button>
      </form>

      <p className="text-sm">
        Déjà un compte ?{" "}
        <Link href="/auth/sign-in" className="text-blue-600 underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}


