// app/terms-salesroom/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

async function acceptTerms() {
  'use server'

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ terms_accepted_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    console.error('Erreur mise à jour terms_accepted_at :', updateError.message)
    return
  }

  redirect('/plans')
}

export default function TermsSalesroomPage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 24,
        color: 'white',
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>
        Conditions d’utilisation SalesRoomAI2
      </h1>

      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Ici tu mettras ton vrai texte de conditions d’utilisation. En cliquant
        sur “J’accepte”, tu confirmes avoir lu et accepté ces conditions.
      </p>

      <form action={acceptTerms}>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #22c55e',
            backgroundColor: '#16a34a',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          J’accepte les conditions
        </button>
      </form>
    </main>
  )
}
