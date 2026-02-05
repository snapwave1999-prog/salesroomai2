// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LogoutButton } from '../LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1) Vérifier l'auth
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // 2) Charger le profil lié à l'utilisateur
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, terms_accepted_at, plan')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Erreur chargement profil :', profileError.message)
    // En cas de problème de profil, on renvoie l'utilisateur au login
    redirect('/login')
  }

  // 3) Si pas de profil, tu peux choisir :
  // - soit en créer un automatiquement avec un trigger Supabase,
  // - soit rediriger vers une page d'onboarding.
  if (!profile) {
    // Pour l'instant, on renvoie au login
    redirect('/login')
  }

  // 4) Vérifier acceptation des conditions SalesRoom
  if (!profile.terms_accepted_at) {
    redirect('/terms-salesroom') // adapte l'URL à ta vraie page de conditions SalesRoom
  }

  // 5) Vérifier le plan
  if (!profile.plan) {
    redirect('/plans')
  }

  // Si tout est OK, on affiche le dashboard normal
  return (
    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 24,
        color: 'white',
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>Tableau de bord</h1>

      <p
        style={{
          marginBottom: 24,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <span>Connecté en tant que {user.email}</span>
        <LogoutButton />
      </p>

      <div style={{ display: 'flex', gap: 16 }}>
        <a
          href="/salesroom"
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 8,
            border: '1px solid #475569',
            backgroundColor: '#020617',
            textDecoration: 'none',
            color: 'white',
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>SalesRoom</h2>
          <p style={{ opacity: 0.8 }}>
            Travailler ton script et t’entraîner avec l’avatar client.
          </p>
        </a>

        <a
          href="/encan"
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 8,
            border: '1px solid #475569',
            backgroundColor: '#020617',
            textDecoration: 'none',
            color: 'white',
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Encan</h2>
          <p style={{ opacity: 0.8 }}>
            Mode encan temps réel (à brancher sur ton module encan).
          </p>
        </a>
      </div>
    </main>
  )
}


