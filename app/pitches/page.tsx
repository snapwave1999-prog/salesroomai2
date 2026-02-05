// app/pitches/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Pitch = {
  id: number;
  Titre: string;
  Texte?: string | null;
  auction_status?: string | null;
  ends_at?: string | null;
  starting_bid?: number | null;
};

export default function PitchesPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [titre, setTitre] = useState<string>('');
  const [texte, setTexte] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [startingBid, setStartingBid] = useState<number | ''>('');
  const [creating, setCreating] = useState<boolean>(false);

  const [now, setNow] = useState<Date>(new Date());

  // <<< NOUVEAU STATE POUR LE BOUTON >>>
  const [closingExpired, setClosingExpired] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPitches = async () => {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .select(
          'id, "Titre", "Texte", auction_status, ends_at, starting_bid'
        )
        .order('id', { ascending: false });

      if (error) {
        console.error('Erreur chargement pitches:', error);
        return;
      }

      setPitches((data || []) as Pitch[]);
    } catch (err) {
      console.error('Erreur chargement pitches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPitches();
  }, []);

  const handleCreatePitch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!titre.trim() || !texte.trim()) {
      alert('Titre et Texte sont obligatoires.');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/pitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre,
          description: texte,
          durationMinutes,
          startingBid: startingBid === '' ? null : Number(startingBid),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        console.error('Erreur création encan:', data);
        alert(data?.message || "Erreur lors de la création de l'encan.");
        return;
      }

      const newPitch: Pitch = data.data;
      setPitches((prev) => [newPitch, ...prev]);

      setTitre('');
      setTexte('');
      setStartingBid('');
      alert("Encan créé avec succès.");
    } catch (err) {
      console.error('Erreur réseau création encan:', err);
      alert('Erreur réseau.');
    } finally {
      setCreating(false);
    }
  };

  // <<< NOUVELLE FONCTION POUR FERMER LES ENCANS EXPIRÉS >>>
  const handleCloseExpired = async () => {
    setClosingExpired(true);
    try {
      const res = await fetch('/api/close-expired-auctions', {
        method: 'POST',
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        console.error('Erreur fermeture encans expirés:', data);
        alert(data?.message || 'Erreur lors de la fermeture des encans.');
      } else {
        alert(
          data?.message ||
            `Encans expirés fermés. (${data?.count ?? '0'} encan(s))`
        );
        await loadPitches(); // recharge la liste localement
      }
    } catch (err) {
      console.error('Erreur réseau close-expired-auctions:', err);
      alert('Erreur réseau lors de la fermeture des encans.');
    } finally {
      setClosingExpired(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 8,
    marginTop: 4,
    color: 'white',
    backgroundColor: '#111',
    border: '1px solid #555',
  };

  const getTimeInfo = (pitch: Pitch) => {
    if (!pitch.ends_at) return 'Fin : non définie';

    const end = new Date(pitch.ends_at);
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) {
      return `Terminé (${end.toLocaleString()})`;
    }

    const totalSec = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;

    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    return `Reste : ${mm}:${ss} (fin ${end.toLocaleTimeString()})`;
  };

  const renderedPitches = useMemo(() => pitches, [pitches]);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, color: 'white' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Pitches / Encans</h1>

      {/* <<< BOUTON FERMER LES ENCANS EXPIRÉS >>> */}
      <button
        type="button"
        onClick={handleCloseExpired}
        disabled={closingExpired}
        style={{
          marginBottom: 16,
          padding: '6px 12px',
          backgroundColor: '#ef4444',
          border: 'none',
          borderRadius: 4,
          color: 'white',
          cursor: 'pointer',
          opacity: closingExpired ? 0.6 : 1,
        }}
      >
        {closingExpired
          ? 'Fermeture des encans expirés...'
          : 'Fermer les encans expirés (+ SMS)'}
      </button>

      {/* Formulaire de création */}
      <section
        style={{
          marginBottom: 24,
          padding: 16,
          border: '1px solid #444',
          borderRadius: 8,
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Créer un nouvel encan</h2>

        <form onSubmit={handleCreatePitch}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: 'white' }}>
              Titre
              <br />
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                style={inputStyle}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ color: 'white' }}>
              Texte / Description
              <br />
              <textarea
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                required
                rows={3}
                style={inputStyle}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ color: 'white' }}>
              Durée de l&apos;encan (minutes)
              <br />
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={1}
                required
                style={inputStyle}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ color: 'white' }}>
              Mise de départ (optionnel)
              <br />
              <input
                type="number"
                value={startingBid}
                onChange={(e) =>
                  setStartingBid(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                min={0}
                style={inputStyle}
                placeholder="0 = pas de mise de départ"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={creating}
            style={{
              padding: '8px 16px',
              backgroundColor: '#52c41a',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {creating ? 'Création...' : "Créer l'encan"}
          </button>
        </form>
      </section>

      {/* Liste des encans */}
      <section>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Liste des encans</h2>

        {loading ? (
          <p>Chargement...</p>
        ) : renderedPitches.length === 0 ? (
          <p>Aucun encan pour le moment.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {renderedPitches.map((pitch) => {
              const isOpen = pitch.auction_status === 'open';
              const timeInfo = getTimeInfo(pitch);

              return (
                <li
                  key={pitch.id}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    border: '1px solid #333',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <strong>{pitch.Titre || '(Sans titre)'}</strong>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 12,
                          backgroundColor: isOpen ? '#093' : '#702020',
                          color: 'white',
                        }}
                      >
                        {isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>

                    <span>{pitch.Texte || ''}</span>
                    <br />
                    {pitch.starting_bid != null && (
                      <span
                        style={{
                          fontSize: 12,
                          opacity: 0.9,
                          display: 'block',
                        }}
                      >
                        Mise de départ : {pitch.starting_bid} $
                      </span>
                    )}
                    <span style={{ fontSize: 12, opacity: 0.9 }}>
                      {timeInfo}
                    </span>
                  </div>

                  <a
                    href={`/room2?id=${pitch.id}`}
                    style={{
                      marginLeft: 16,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #555',
                      textDecoration: 'none',
                      color: '#52c41a',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Ouvrir la salle
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}







