// app/onboarding/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px 16px 48px",
        color: "white",
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>
          Bienvenue sur SalesRoomAI2
        </p>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>
          Premiers pas pour lancer ton premier encan
        </h1>
        <p style={{ fontSize: 15, opacity: 0.85, maxWidth: 640 }}>
          En 3 étapes simples, tu passes de “nouveau compte” à “premier encan en
          ligne”. Tu peux suivre le guide ou revenir plus tard depuis ton
          tableau de bord.
        </p>
      </header>

      {/* Étapes */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {/* Étape 1 */}
        <div
          style={{
            borderRadius: 12,
            border: "1px solid #4b5563",
            padding: 16,
            background:
              "linear-gradient(145deg, rgba(15,23,42,1) 0%, rgba(15,23,42,0.9) 100%)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              opacity: 0.7,
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Étape 1
          </p>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>
            Crée ta première SalesRoom
          </h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
            Une SalesRoom est ta salle d&apos;encan virtuelle. Donne-lui un nom
            clair (ex. &quot;Encan du 15 mars&quot;), ajoute une courte description et
            choisis les options de base.
          </p>
          <Link
            href="/salesroom"
            style={{
              display: "inline-block",
              marginTop: 4,
              padding: "8px 14px",
              borderRadius: 999,
              backgroundColor: "#22c55e",
              color: "white",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Aller à la page SalesRoom
          </Link>
        </div>

        {/* Étape 2 */}
        <div
          style={{
            borderRadius: 12,
            border: "1px solid #4b5563",
            padding: 16,
            background:
              "linear-gradient(145deg, rgba(15,23,42,1) 0%, rgba(15,23,42,0.9) 100%)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              opacity: 0.7,
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Étape 2
          </p>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>
            Ajoute un encan (même test)
          </h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
            Crée un premier encan, même fictif, pour voir comment tout
            fonctionne. Ajoute quelques lots, un prix de départ et une date de
            fin.
          </p>
          <Link
            href="/encan"
            style={{
              display: "inline-block",
              marginTop: 4,
              padding: "8px 14px",
              borderRadius: 999,
              backgroundColor: "#3b82f6",
              color: "white",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Aller à la page Encan
          </Link>
        </div>

        {/* Étape 3 */}
        <div
          style={{
            borderRadius: 12,
            border: "1px solid #4b5563",
            padding: 16,
            background:
              "linear-gradient(145deg, rgba(15,23,42,1) 0%, rgba(15,23,42,0.9) 100%)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              opacity: 0.7,
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Étape 3
          </p>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>
            Invite des participants
          </h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
            Partage le lien de ta SalesRoom ou de ton encan à tes clients.
            Commence par un petit groupe pour tester le flux en temps réel et
            ajuster ton animation.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              marginTop: 4,
              padding: "8px 14px",
              borderRadius: 999,
              backgroundColor: "#6366f1",
              color: "white",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Aller au tableau de bord
          </Link>
        </div>
      </section>

      {/* Section aide rapide */}
      <section
        style={{
          borderRadius: 12,
          border: "1px solid #4b5563",
          padding: 16,
          background:
            "linear-gradient(145deg, rgba(15,23,42,1) 0%, rgba(15,23,42,0.9) 100%)",
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Besoin d&apos;aide?</h2>
        <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
          Tu peux revenir à cette page d&apos;onboarding en tout temps depuis ton
          compte. Pour toute question, contacte le support directement depuis la
          plateforme.
        </p>
        <p style={{ fontSize: 13, opacity: 0.8 }}>
          Astuce : la majorité des utilisateurs qui réussissent leur premier
          encan créent une SalesRoom test, ajoutent 2–3 lots fictifs et font un
          encan privé avec des collègues avant de lancer un vrai événement.
        </p>
      </section>
    </main>
  );
}

