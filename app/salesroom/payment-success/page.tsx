'use client';

import { useEffect, useState } from 'react';

type MarkPaidResponse = {
  status?: string;
  error?: string;
};

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Validation du paiement en cours...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');

    if (!orderId) {
      setStatus('error');
      setMessage('Aucun orderId fourni dans l’URL.');
      return;
    }

    void (async () => {
      try {
        const res = await fetch('/api/auction-mark-paid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        const json = (await res.json()) as MarkPaidResponse;

        if (!res.ok || json.error) {
          setStatus('error');
          setMessage(json.error || 'Erreur lors de la validation du paiement.');
          return;
        }

        if (json.status === 'already_paid' || json.status === 'paid') {
          setStatus('ok');
          setMessage('Paiement confirmé, votre ordre est maintenant payé.');
        } else {
          setStatus('ok');
          setMessage('Paiement traité.');
        }
      } catch {
        setStatus('error');
        setMessage('Erreur réseau lors de la validation du paiement.');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Confirmation de paiement
        </h1>
        <p
          className={
            status === 'error'
              ? 'text-sm text-red-700'
              : 'text-sm text-gray-800'
          }
        >
          {message}
        </p>

        <a
          href="/"
          className="mt-6 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          Retour à l’accueil
        </a>
      </div>
    </div>
  );
}
