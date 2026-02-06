'use client';

import React, { useState, FormEvent } from 'react';

type Offer = {
  id: string;
  room_id: string;
  amount: number;
  bidder_name: string | null;
  created_at: string;
};

type RoomClientProps = {
  roomId: string;
};

export default function RoomClient({ roomId }: RoomClientProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitOffer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // On capture le form AVANT les await (sinon e.currentTarget devient null)
    const form = e.currentTarget;

    try {
      setSubmitting(true);

      const formData = new FormData(form);
      const amountRaw = formData.get('amount');
      const bidderNameRaw = formData.get('bidder_name');

      const amount = Number(amountRaw);
      const bidderName =
        typeof bidderNameRaw === 'string' && bidderNameRaw.trim()
          ? bidderNameRaw.trim()
          : null;

      if (!Number.isFinite(amount) || amount <= 0) {
        setError('Montant invalide.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          amount,
          bidderName,
        }),
      });

      if (!res.ok) {
        let details: any = null;
        try {
          details = await res.json();
        } catch {
          // pas de JSON dans la réponse d'erreur
        }

        console.error('Erreur réseau offers:', {
          status: res.status,
          statusText: res.statusText,
          details,
        });

        setError('Erreur réseau lors de la mise.');
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      const newOffer: Offer = data.offer;

      setOffers((prev) => [newOffer, ...prev]);

      // reset du form via la ref capturée
      form.reset();
    } catch (err) {
      console.error('Erreur réseau offers:', err);
      setError('Erreur réseau lors de la mise.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">Salle d&apos;offres</h2>

      <form onSubmit={handleSubmitOffer} className="mb-4 space-y-3">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Montant de la mise
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={1}
            step={1}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ex. 50"
          />
        </div>

        <div>
          <label
            htmlFor="bidder_name"
            className="block text-sm font-medium text-gray-700"
          >
            Ton nom (optionnel)
          </label>
          <input
            id="bidder_name"
            name="bidder_name"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ex. Jean"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
            submitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {submitting ? 'Envoi...' : 'Enchérir'}
        </button>
      </form>

      <div>
        <h3 className="mb-2 text-lg font-semibold">
          Dernières offres dans cette salle
        </h3>
        {offers.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucune offre pour le moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {offers.map((offer) => (
              <li
                key={offer.id}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {offer.amount} $
                  </p>
                  <p className="text-xs text-gray-600">
                    {offer.bidder_name || 'Anonyme'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(offer.created_at).toLocaleString('fr-CA')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}




























