// app/admin/page.tsx
import { createClient } from '@/utils/supabase/server';
import { AdminCreateUserForm } from './AdminCreateUserForm';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log('ADMIN DEBUG user =', user);
  console.log('ADMIN DEBUG userError =', userError);

  if (userError || !user) {
    return (
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, color: 'white' }}>
        <h1>Debug Admin</h1>
        <p style={{ color: 'red' }}>
          ❌ PAS CONNECTÉ - userError: {userError?.message || 'null'}
        </p>
        <p>Va sur /login et reconnecte-toi.</p>
      </main>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .maybeSingle();

  console.log('ADMIN DEBUG profile =', profile);
  console.log('ADMIN DEBUG profileError =', profileError);

  if (!profile || profile.is_admin !== true) {
    return (
      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, color: 'white' }}>
        <h1>Debug Admin</h1>
        <p>✅ Connecté : {user.email}</p>
        <p style={{ color: 'orange' }}>
          ❌ PAS ADMIN - profile: {JSON.stringify(profile)}
        </p>
        <p>user.id = {user.id}</p>
        <p>Tu dois avoir is_admin = true dans la table profiles.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, color: 'white' }}>
      <h1>✅ PANNEAU ADMIN</h1>
      <p>Connecté en tant que {user.email} (admin)</p>
      <AdminCreateUserForm />
    </main>
  );
}



