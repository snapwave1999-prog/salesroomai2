// app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#050816',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 880,
          width: '100%',
          padding: 32,
          borderRadius: 16,
          border: '1px solid #1f2937',
          background:
            'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))',
          boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.5fr)',
          gap: 24,
        }}
      >
        {/* Bloc gauche : hero texte */}
        <div>
          <p
            style={{
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: 1,
              opacity: 0.7,
              marginBottom: 6,
            }}
          >
            Salles de vente en ligne
          </p>

          <h1 style={{ fontSize: 34, marginBottom: 12, lineHeight: 1.2 }}>
            Crée tes SalesRooms, ajoute l&apos;option encan seulement si tu en as
            besoin.
          </h1>

          <p
            style={{
              opacity: 0.85,
              marginBottom: 20,
              lineHeight: 1.6,
              fontSize: 15,
            }}
          >
            SalesRoomAI2 te permet d&apos;animer des salles de vente virtuelles avec
            ton public : présentation de lots, discussion en direct, prise de
            décisions. Quand tu le souhaites, tu peux activer un encan relié à
            ta SalesRoom pour laisser les mises monter en temps réel.
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <Link
              href="/login"
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                backgroundColor: '#22c55e',
                color: '#0b1120',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Se connecter / Créer un compte
            </Link>

            <Link
              href="/plans"
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: '1px solid #4b5563',
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              Voir les forfaits
            </Link>
          </div>

          <p style={{ fontSize: 12, opacity: 0.7 }}>
            Commence par une SalesRoom simple, puis ajoute des encans seulement
            pour tes événements qui le demandent.
          </p>
        </div>

        {/* Bloc droit : aperçu du flux */}
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.3)',
            padding: 16,
            background:
              'radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 55%)',
            fontSize: 13,
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>
            Comment ça fonctionne ?
          </h2>
          <ol
            style={{
              paddingLeft: 18,
              margin: 0,
              marginBottom: 12,
              lineHeight: 1.6,
            }}
          >
            <li>
              Crée une <strong>SalesRoom</strong> pour ton événement (présentation,
              vente, levée de fonds, etc.).
            </li>
            <li>
              Ajoute tes <strong>lots</strong>, tes informations et ton script
              d&apos;animation.
            </li>
            <li>
              Optionnel : relie un <strong>encan</strong> à ta SalesRoom pour
              faire monter les mises en direct.
            </li>
          </ol>

          <p style={{ opacity: 0.8, marginBottom: 10 }}>
            Tu peux utiliser SalesRoomAI2 uniquement comme salle de vente
            virtuelle, ou activer la partie encan quand c&apos;est pertinent pour
            ton événement.
          </p>

          <div
            style={{
              marginTop: 8,
              paddingTop: 10,
              borderTop: '1px solid rgba(148,163,184,0.25)',
              opacity: 0.8,
            }}
          >
            <p style={{ marginBottom: 4 }}>
              La logique détaillée des <strong>enchères</strong> (durée, mise de
              départ, clôture automatique) se trouve sur la page
              <strong> Encan</strong>.
            </p>
            <p style={{ margin: 0 }}>
              Les SalesRooms restent ton espace principal pour présenter, parler
              avec ton public et gérer l&apos;événement en direct.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}






























