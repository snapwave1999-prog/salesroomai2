import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-slate-950 text-slate-50">
        <header className="border-b border-slate-800 bg-slate-900">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-emerald-400">
                SRSalesRoomAI
              </span>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-slate-200 hover:text-emerald-400 transition"
              >
                Accueil
              </Link>
              <Link
                href="/pitches"
                className="text-slate-200 hover:text-emerald-400 transition"
              >
                Pitches
              </Link>
              {/* Lien corrigé vers la nouvelle salle */}
              <Link
                href="/room2?id=29"
                className="text-slate-200 hover:text-emerald-400 transition"
              >
                Ouvrir une room
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

