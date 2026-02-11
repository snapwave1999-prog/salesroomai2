'use client';

import { useEffect, useState } from 'react';

type Pitch = {
  id: number;
  Titre: string;
  Texte: string;
  auction_status: string | null;
  ends_at: string | null;
};

type Offer = {
  id: number;
  amount: number;
  created_at: string;
};

type RoomData = {
  ok: boolean;
  pitch: Pitch;
  offers: Offer[];
};

export default function RoomClientPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RoomData | null>(null);

  useEffect(() => {
    async function loadRoom() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/room2-data');

        if (!res.ok) {
          console.error('Erreur chargement room', res.status);
          setError(`Erreur chargement room (${res.status})`);
          setLoading(false);
          return;
        }

        const json: RoomData = await res.json();
        console.log('ROOM2 DATA', json);
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error('Erreur réseau room', err);
        setError('Erreur réseau lors du chargement de la salle.');
        setLoading(false);
      }
    }

    loadRoom();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-2">
          Room client pour le pitch #1
        </h1>
        <p>Chargement de la salle...</p>
      </div>
    );
  }

  if (error || !data || !data.ok) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-2">
          Room client pour le pitch #1
        </h1>
        <p className="text-red-600">
          {error ?? 'Impossible de charger la salle.'}
        </p>
      </div>
    );
  }

  const { pitch, offers } = data;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">
        Room client pour le pitch #{pitch.id}
      </h1>

      <div className="border rounded p-3 bg-white">
        <h2 className="text-xl font-medium mb-2">{pitch.Titre}</h2>
        <p className="mb-2">{pitch.Texte}</p>
        <p className="text-sm text-gray-600">
          Statut: {pitch.auction_status ?? 'N/A'} – Fin:{' '}
          {pitch.ends_at ?? 'N/A'}
        </p>
      </div>

      <div className="border rounded p-3 bg-white">
        <h3 className="text-lg font-medium mb-2">Offres récentes</h3>
        {offers.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune offre pour le moment.</p>
        ) : (
          <ul className="space-y-1">
            {offers.map((offer) => (
              <li key={offer.id} className="text-sm">
                <span className="font-medium">{offer.amount.toFixed(2)} $</span>{' '}
                – {new Date(offer.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}








































































