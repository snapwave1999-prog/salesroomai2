// app/room2/room-client.tsx
'use client';

import { useEffect, useState } from 'react';

type Offer = {
  id: number;
  amount: number;
  created_at: string;
};

type PitchData = {
  id: number;
  Titre: string;
  Texte?: string | null;
  auction_status?: string | null;
  ends_at?: string | null;
};

type RoomClientProps = {
  pitchId: number;
};

export default function RoomClient({ pitchId }: RoomClientProps) {
  const [pitch, setPitch] = useState<PitchData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [closingInProgress, setClosingInProgress] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/room2-data?pitchId=${pitchId}`);
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        console.error('Erreur chargement room2-data:', data);
        alert(data?.message || 'Erreur lors du chargement de la salle.');
        return;
      }

      const { pitch: p, offers: o } = data;
      setPitch(p);
      setOffers(o || []);

      if (p?.ends_at) {
        const end = new Date(p.ends_at);
        const diffSec = Math.floor((end.getTime() - Date.now()) / 1000);
        const initial = diffSec > 0 ? diffSec : 0;
        setRemainingSeconds(initial);
        setIsFinished(initial <= 0 || p.auction_status === 'closed');
      } else {
        setRemainingSeconds(null);
        setIsFinished(p.auction_status === 'closed');
      }
    } catch (err) {
      console.error('Erreur réseau room2-data:', err);
      alert('Erreur réseau lors du chargement de la salle.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pitchId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev == null) return prev;
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pitch) return;
    if (remainingSeconds == null) return;
    if (closingInProgress) return;

    if (remainingSeconds <= 0 && !isFinished && pitch.auction_status === 'open') {
      closeAuctionAutomatically();
    }
  }, [remainingSeconds, pitch, isFinished, closingInProgress]);

  const closeAuctionAutomatically = async () => {
    if (!pitch) return;
    setClosingInProgress(true);
    console.log('Tentative de fermeture auto de l’encan', pitch.id);

    try {
      const res = await fetch('/api/close-auction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch.id }),
      });
      const data = await res.json().catch(() => null);

      console.log('Réponse /api/close-auction:', res.status, data);

      if (!res.ok || !data?.ok) {
        console.error('Erreur fermeture auto encan:', data);
        setIsFinished(true);
      } else {
        setIsFinished(true);
        setPitch((prev) =>
          prev ? { ...prev, auction_status: 'closed' } : prev
        );
      }
    } catch (err) {
      console.error('Erreur réseau fermeture auto encan:', err);
      setIsFinished(true);
    } finally {
      setClosingInProgress(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pitch) return;

    const formData = new FormData(e.currentTarget);
    const amountStr = formData.get('amount') as string;

    const amount = Number(amountStr);
    if (!amount || amount <= 0) {
      alert('Montant invalide.');
      return;
    }

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchId: pitch.id,
          amount,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        alert(data?.message || 'Erreur lors de la mise.');
        return;
      }

      const newOffer: Offer = data.offer;
      setOffers((prev) => [newOffer, ...prev]);
      e.currentTarget.reset();
    } catch (err) {
      console.error('Erreur réseau offers:', err);
      alert('Erreur réseau lors de la mise.');
    }
  };

  if (loading) {
    return <p style={{ color: 'white' }}>Chargement de la salle...</p>;
  }

  if (!pitch) {
    return <p style={{ color: 'white' }}>Encan introuvable.</p>;
  }

  const isClosed = pitch.auction_status === 'closed' || isFinished;

  let timerText = 'Temps restant : --:--';
  if (remainingSeconds != null) {
    if (remainingSeconds <= 0) {
      timerText = 'Temps restant : 00:00';
    } else {
      const min = Math.floor(remainingSeconds / 60);
      const sec = remainingSeconds % 60;
      const mm = min.toString().padStart(2, '0');
      const ss = sec.toString().padStart(2, '0');
      timerText = `Temps restant : ${mm}:${ss}`;
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, color: 'white' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Salle d&apos;encan</h1>

      <p style={{ marginBottom: 4 }}>
        <strong>Statut encan :</strong>{' '}
        {isClosed ? 'fermé' : 'ouvert'}
      </p>
      <p style={{ marginBottom: 8 }}>{timerText}</p>

      <h2 style={{ fontSize: 20, marginBottom: 4 }}>{pitch.Titre}</h2>
      {pitch.Texte && <p style={{ marginBottom: 12 }}>{pitch.Texte}</p>}

      {!isClosed ? (
        <form onSubmit={handleSubmitOffer} style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <label>
              Montant de la mise
              <br />
              <input type="number" name="amount" min={1} required />
            </label>
          </div>
          <button type="submit">Envoyer la mise</button>
        </form>
      ) : (
        <p style={{ color: '#f97373', marginBottom: 16 }}>
          L&apos;encan est terminé. Aucune nouvelle mise n&apos;est acceptée.
        </p>
      )}

      <h3 style={{ fontSize: 18, marginBottom: 8 }}>Toutes les mises</h3>
      {offers.length === 0 ? (
        <p>Aucune mise encore.</p>
      ) : (
        <ul>
          {offers.map((offer) => (
            <li key={offer.id}>
              {offer.amount} $ — {new Date(offer.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

























