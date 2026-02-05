// app/plans/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import PlansList from './plans-client';

// Server Action : choisir un plan interne (free, pro, premium)
async function chooseInternalPlanAction(formData: FormData) {
  'use server';

  const plan = String(formData.get('plan') ?? '').trim();
  if (!plan) return;

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ plan })
    .eq('id', user.id);

  if (updateError) {
    console.error('Erreur mise à jour du plan :', updateError.message);
    return;
  }

  redirect('/dashboard');
}

export default async function PlansPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();

  const currentPlan = profile?.plan ?? 'free';

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 24,
        color: 'white',
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>Choisis ton forfait</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Sélectionne le plan qui correspond à ton usage de SalesRoomAI2. Tu pourras
        changer de plan plus tard.
      </p>

      <PlansList
        currentPlan={currentPlan}
        chooseInternalPlanAction={chooseInternalPlanAction}
      />

      <section style={{ marginTop: 32, fontSize: 14, opacity: 0.85 }}>
  <h2 style={{ fontSize: 18, marginBottom: 8 }}>Ce que chaque plan inclut</h2>
  <ul style={{ paddingLeft: 16, margin: 0, lineHeight: 1.5 }}>
    <li>
      <strong>Free</strong> : 1 SalesRoom, 1 encan, idéal pour tester la
      plateforme avant de t&apos;engager.
    </li>
    <li>
      <strong>Pro</strong> : 10 SalesRooms, 10 encans, parfait pour un
      animateur ou une petite équipe qui fait des encans régulièrement.
    </li>
    <li>
      <strong>Premium</strong> : SalesRooms et encans illimités pour un
      seul client (une seule organisation), adapté à un usage intensif.
    </li>
  </ul>
</section>

      <p style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        Le plan Free est géré en interne. Les plans Pro et Premium pourront
        passer par Stripe Checkout plus tard (mode test dans un premier temps).
      </p>
    </main>
  );
}



