// app/admin/AdminCreateUserForm.tsx
'use client';

import { useState } from 'react';

export function AdminCreateUserForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        alert(data?.message || 'Erreur création utilisateur.');
        return;
      }
      alert('Utilisateur créé ✅');
      setEmail('');
      setPassword('');
    } catch (err) {
      alert('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}
    >
      <input
        type="email"
        placeholder="Email utilisateur"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, borderRadius: 4 }}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 8, borderRadius: 4 }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: 8,
          borderRadius: 4,
          border: 'none',
          backgroundColor: '#22c55e',
          color: 'white',
          cursor: 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Création...' : 'Créer l’utilisateur'}
      </button>
    </form>
  );
}
