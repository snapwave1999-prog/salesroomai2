// app/login/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  // IMPORTANT : les "name" du form doivent être "email" et "password"
  const email = formData.get('email') as string | null;
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    // Tu peux rediriger vers une page d'erreur ou juste retourner
    redirect('/login?error=missing');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Erreur login:', error);
    redirect('/login?error=auth');
  }

  // Revalidations si tu veux, puis redirection
  redirect('/dashboard');
}
