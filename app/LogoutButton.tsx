// app/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export function LogoutButton() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '6px 12px',
        borderRadius: 4,
        border: 'none',
        backgroundColor: '#ef4444',
        color: 'white',
        cursor: 'pointer',
      }}
    >
      Se déconnecter
    </button>
  );
}

