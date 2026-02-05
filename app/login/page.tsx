// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/utils/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Email et mot de passe requis.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur login:', error);
        setErrorMsg('Email ou mot de passe invalide.');
        return;
      }

      // Succès : on redirige vers la page demandée ou vers /salesroom
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirectTo') || '/salesroom';
      router.push(redirectTo);
    } catch (err) {
      console.error('Erreur réseau login:', err);
      setErrorMsg('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 400,
        margin: '0 auto',
        padding: 24,
        color: 'white',
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 16 }}>Connexion</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 4,
              border: '1px solid #475569',
              backgroundColor: '#020617',
              color: 'white',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 4,
              border: '1px solid #475569',
              backgroundColor: '#020617',
              color: 'white',
            }}
          />
        </div>

        {errorMsg && (
          <p style={{ color: '#f97316', fontSize: 14 }}>{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: '8px 12px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}




         