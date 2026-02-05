// app/api/auth-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, mode } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Erreur signUp:', error);
        return NextResponse.json(
          { ok: false, message: error.message || 'Erreur inscription.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { ok: true, message: 'Compte créé (vérifiez vos emails si nécessaire).' },
        { status: 200 }
      );
    }

    // mode login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Erreur signIn:', error);
      return NextResponse.json(
        { ok: false, message: 'Identifiants invalides.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'Connexion réussie.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur /api/auth-email:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
