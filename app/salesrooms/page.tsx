// app/salesrooms/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Salesroom = {
  id: string;
  title: string | null;
  subtitle: string | null;
};

export default function SalesRoomsListPage() {
  const [rooms, setRooms] = useState<Salesroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRooms() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('salesrooms')
        .select('id, title, subtitle')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        setError(`Erreur Supabase: ${error.message ?? 'inconnue'}`);
      } else {
        setRooms((data ?? []) as Salesroom[]);
      }

      setLoading(false);
    }

    loadRooms();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">SalesRooms</h1>

        {loading && <p className="text-slate-700">Chargement des salles...</p>}

        {error && !loading && (
          <p className="text-red-600 whitespace-pre-wrap">{error}</p>
        )}

        {!loading && rooms.length === 0 && !error && (
          <p className="text-slate-700">
            Aucune salle pour l&apos;instant.
          </p>
        )}

        <div className="grid gap-4">
          {rooms.map((room) => {
            const params = new URLSearchParams({
              salesroomId: room.id,
              title: room.title ?? '',
              subtitle: room.subtitle ?? '',
            });

            return (
              <div
                key={room.id}
                className="border rounded-lg bg-white shadow-sm p-4 flex flex-col gap-2"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {room.title ?? 'Salle sans titre'}
                </h2>
                {room.subtitle && (
                  <p className="text-sm text-slate-700">
                    {room.subtitle}
                  </p>
                )}
                <p className="text-xs text-slate-500 break-all">
                  ID : {room.id}
                </p>

                <div className="flex gap-3 mt-2">
                  <Link
                    href={`/salesroom?${params.toString()}`}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Ouvrir la salle
                  </Link>
                  <Link
                    href={`/salesroom-avatar?${params.toString()}`}
                    className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                  >
                    Ouvrir l&apos;avatar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
