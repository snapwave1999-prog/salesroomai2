'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { placeBid } from './actions';

type Auction = {
  uuid: string;
  title: string;
  status: string;
  created_at: string;
  start_price: number;
  ends_at: string | null;
  duration_seconds: number | null;
  salesroom_id: string | null;
};

type Bid = {
  id: string;
  created_at: string;
  amount: number;
  paddle_number: string | null;
};

export function EncanRoomClient({
  auction,
  bids,
  salesroomName,
}: {
  auction: Auction;
  bids: Bid[];
  salesroomName: string | null;
}) {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (!auction.ends_at) return null;
    const diff = new Date(auction.ends_at).getTime() - Date.now();
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  });

  const [bidAmount, setBidAmount] = useState<string>(
    String(auction.start_price || 0)
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        const next = prev - 1;
        return next >= 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formattedCountdown =
    timeLeft === null
      ? 'Aucune durée définie'
      : timeLeft <= 0
      ? 'Encan terminé'
      : formatSeconds(timeLeft);

  function handleSubmitBid(formData: FormData) {
    formData.set('auction_uuid', auction.uuid);
    formData.set('amount', bidAmount.replace(',', '.'));

    startTransition(async () => {
      try {
        await placeBid(formData);
        setMessage(`Mise envoyée : ${bidAmount}`);
        router.refresh();
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors de l'envoi de la mise.");
      }
    });
  }

  const highestBid =
    bids && bids.length > 0
      ? bids.reduce((max, b) => (b.amount > max ? b.amount : max), 0)
      : null;

  return (
    <>
      <header style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <h1 style={{ fontSize: 24 }}>
            Encan : <span style={{ fontWeight: 600 }}>{auction.title}</span>
          </h1>

          <Link
            href="/encan"
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid #4b5563',
              color: 'white',
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            ← Retour à la liste
          </Link>
        </div>

        <p style={{ marginBottom: 4, opacity: 0.7, fontSize: 12 }}>
          UUID : {auction.uuid}
        </p>

        <p style={{ marginBottom: 4, opacity: 0.7, fontSize: 12 }}>
          SalesRoom liée :{' '}
          {salesroomName
            ? `${salesroomName} (${auction.salesroom_id})`
            : 'aucune (non liée pour le moment)'}
        </p>

        <div style={{ display: 'flex', gap: 12, fontSize: 13, marginTop: 4 }}>
          <span>
            Statut :{' '}
            <span
              style={{
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 999,
                border: '1px solid #475569',
                textTransform: 'uppercase',
                opacity: auction.status === 'closed' ? 0.7 : 1,
              }}
            >
              {auction.status}
            </span>
          </span>
          <span>Prix de départ : {auction.start_price}</span>
          {highestBid !== null && (
            <span>Meilleure mise actuelle : {highestBid}</span>
          )}
        </div>

        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          Créé le {formatDateTime(auction.created_at)}
        </p>
      </header>

      {/* reste du fichier identique : compte à rebours, formulaire, liste des mises */}

      <section
        style={{
          padding: 16,
          borderRadius: 8,
          border: '1px solid #475569',
          backgroundColor: '#020617',
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Compte à rebours</h2>
        <p style={{ fontSize: 16 }}>{formattedCountdown}</p>
        {auction.duration_seconds && (
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Durée prévue : {formatSeconds(auction.duration_seconds)}
          </p>
        )}
      </section>

      <section
        style={{
          padding: 16,
          borderRadius: 8,
          border: '1px solid #475569',
          backgroundColor: '#020617',
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Placer une mise</h2>
        <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          Entre le montant de ta mise, puis clique sur “Miser”. Pour l&apos;instant,
          le numéro de paddle est fixé à 101.
        </p>

        <form
          action={handleSubmitBid}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <input
            name="amount"
            type="number"
            step="0.01"
            min={0}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            style={{
              width: 140,
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid #475569',
              backgroundColor: '#020617',
              color: 'white',
            }}
          />

          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #22c55e',
              backgroundColor: '#16a34a',
              color: 'white',
              cursor: 'pointer',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? 'Envoi...' : 'Miser'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>{message}</p>
        )}
      </section>

      <section
        style={{
          padding: 16,
          borderRadius: 8,
          border: '1px solid #475569',
          backgroundColor: '#020617',
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Dernières mises</h2>

        {(!bids || bids.length === 0) && (
          <p style={{ fontSize: 12, opacity: 0.7 }}>Aucune mise pour le moment.</p>
        )}

        {bids && bids.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {bids.map((bid) => (
              <li
                key={bid.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  padding: '4px 0',
                }}
              >
                <span>
                  {formatDateTime(bid.created_at)} — {bid.amount}
                </span>
                <span style={{ opacity: 0.7 }}>
                  Paddle {bid.paddle_number ?? '101'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



















