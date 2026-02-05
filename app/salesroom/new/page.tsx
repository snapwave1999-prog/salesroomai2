// app/salesroom/new/page.tsx
'use client';

import { useState } from 'react';

export default function NewSalesRoomPage() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Le titre est obligatoire.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/salesroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          price: price ? Number(price) : null,
          year: year ? Number(year) : null,
          mileage_km: mileage ? Number(mileage) : null,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.message || 'Erreur lors de la création.');
      }

      window.location.href = '/salesroom';
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-lg mx-auto px-4 py-10 space-y-4">
        <h1 className="text-xl font-semibold mb-2">
          Nouvelle SalesRoom
        </h1>
        <p className="text-sm text-slate-300">
          Crée un brouillon rapide : tu pourras améliorer le contenu plus tard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">
              Titre de la SalesRoom
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
              placeholder="Ex.: Grand van pour famille, super propre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">
              Sous-titre / note rapide (optionnel)
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
              placeholder="Ex.: 2015, 120 000 km, parfait pour 3 enfants"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Prix</label>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                placeholder="15000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Année</label>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                placeholder="2015"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">KM</label>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                placeholder="120000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400">{errorMsg}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 rounded-md bg-emerald-500 text-slate-950 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? 'Création...' : 'Créer la SalesRoom'}
            </button>
            <a
              href="/salesroom"
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Annuler et retourner à la liste
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}

