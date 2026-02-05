// app/plans/plans-client.tsx
'use client';

type PlansListProps = {
  currentPlan: string | null;
  chooseInternalPlanAction: (formData: FormData) => Promise<void>;
};

export default function PlansList({
  currentPlan,
  chooseInternalPlanAction,
}: PlansListProps) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {/* Free */}
        <PlanCard
          title="Free"
          price="0 $ / mois"
          description="Idéal pour tester SalesRoomAI2 tranquillement."
          features={['1 SalesRoom active', '1 encan', 'Support basique']}
          highlight={false}
          isCurrent={currentPlan === 'free' || !currentPlan}
          plan="free"
          currentPlan={currentPlan}
          chooseInternalPlanAction={chooseInternalPlanAction}
        />

        {/* Pro */}
        <PlanCard
          title="Pro"
          price="29 $ / mois"
          description="Pour les vendeurs réguliers qui veulent plusieurs salles."
          features={[
            'Jusqu’à 10 SalesRooms actives',
            'Jusqu’à 10 encans',
            'Support prioritaire',
          ]}
          highlight
          isCurrent={currentPlan === 'pro'}
          plan="pro"
          currentPlan={currentPlan}
          chooseInternalPlanAction={chooseInternalPlanAction}
        />

        {/* Premium */}
        <PlanCard
          title="Premium"
          price="59 $ / mois"
          description="Pour un usage intensif par un seul client ou une seule organisation."
          features={[
            'SalesRooms illimitées',
            'Encans illimités',
            'Support prioritaire',
          ]}
          highlight={false}
          isCurrent={currentPlan === 'premium'}
          plan="premium"
          currentPlan={currentPlan}
          chooseInternalPlanAction={chooseInternalPlanAction}
        />
      </div>

      {/* Section FAQ sous les forfaits */}
      <section
        style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 12,
          border: '1px solid #4b5563',
          background:
            'linear-gradient(145deg, rgba(15,23,42,1) 0%, rgba(15,23,42,0.9) 100%)',
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>FAQ sur les forfaits</h2>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>
            Un compte peut-il être utilisé par plusieurs clients?
          </p>
          <p style={{ fontSize: 14, opacity: 0.9 }}>
            Non. Chaque compte SalesRoomAI2 est prévu pour un seul client ou une
            seule organisation. Si tu veux gérer des encans pour plusieurs
            clients distincts, chacun doit avoir son propre compte.
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>
            Que veut dire &quot;illimité&quot; dans le forfait Premium?
          </p>
          <p style={{ fontSize: 14, opacity: 0.9 }}>
            Illimité veut dire qu&apos;il n&apos;y a pas de plafond technique sur le
            nombre de SalesRooms et d&apos;encans que tu peux créer pour ce compte,
            dans le cadre d&apos;un usage normal. Le forfait reste réservé à un seul
            client ou une seule organisation.
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>
            Y a-t-il une période d&apos;essai?
          </p>
          <p style={{ fontSize: 14, opacity: 0.9 }}>
            Oui. Tu peux commencer avec le plan Free pour tester la plateforme.
            Ensuite, tu peux passer à Pro ou Premium à tout moment si tu as
            besoin de plus de volume ou de fonctionnalités.
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>
            Comment fonctionne la facturation mensuelle?
          </p>
          <p style={{ fontSize: 14, opacity: 0.9 }}>
            Les abonnements Pro et Premium sont facturés mensuellement à partir
            de la date de ton inscription. Le renouvellement se fait
            automatiquement chaque mois jusqu&apos;à ce que tu modifies ton forfait
            ou annules ton abonnement via ton compte.
          </p>
        </div>

        <div>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>
            Offrez-vous des remboursements?
          </p>
          <p style={{ fontSize: 14, opacity: 0.9 }}>
            En général, les paiements déjà facturés ne sont pas remboursés, mais
            tu peux annuler pour les prochains mois à tout moment. Des
            exceptions peuvent être étudiées au cas par cas selon la situation.
          </p>
        </div>
      </section>
    </>
  );
}

type PlanCardProps = {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  isCurrent: boolean;
  plan: string;
  currentPlan: string | null;
  chooseInternalPlanAction: (formData: FormData) => Promise<void>;
};

function PlanCard({
  title,
  price,
  description,
  features,
  highlight = false,
  isCurrent,
  plan,
  currentPlan,
  chooseInternalPlanAction,
}: PlanCardProps) {
  const isDowngrade =
    currentPlan && currentPlan !== 'free' && plan === 'free';

  return (
    <div
      style={{
        borderRadius: 12,
        border: highlight ? '2px solid #22c55e' : '1px solid #4b5563',
        background:
          'linear-gradient(145deg, rgba(15,23,42,1) 0%, rgba(15,23,42,0.9) 100%)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 220,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 18,
            marginBottom: 4,
            color: highlight ? '#22c55e' : 'white',
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 16, marginBottom: 8, opacity: 0.9 }}>{price}</p>
        <p style={{ fontSize: 13, marginBottom: 12, opacity: 0.8 }}>
          {description}
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: 13,
            opacity: 0.9,
          }}
        >
          {features.map((f) => (
            <li key={f} style={{ marginBottom: 4 }}>
              • {f}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 12 }}>
        {isCurrent ? (
          <span
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #22c55e',
              color: '#22c55e',
              fontSize: 12,
            }}
          >
            Plan actuel
          </span>
        ) : (
          <form action={chooseInternalPlanAction}>
            <input type="hidden" name="plan" value={plan} />
            <button
              type="submit"
              style={{
                marginTop: 4,
                padding: '8px 14px',
                borderRadius: 999,
                border: 'none',
                backgroundColor: highlight ? '#22c55e' : '#4b5563',
                color: 'white',
                cursor: 'pointer',
                fontSize: 13,
                width: '100%',
              }}
            >
              {isDowngrade ? 'Revenir au plan Free' : 'Choisir ce plan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}




