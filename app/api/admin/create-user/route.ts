// app/api/admin/create-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { adminClient } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    // 1) Vérifier que l'appelant est connecté
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, message: 'Non authentifié.' },
        { status: 401 }
      );
    }

    // 2) Vérifier qu'il est admin (is_admin = true dans profiles)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { ok: false, message: 'Accès refusé.' },
        { status: 403 }
      );
    }

    // 3) Récupérer email + mot de passe depuis le body
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    // 4) Créer l'utilisateur via le client admin (service_role)
    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError) {
      console.error('Erreur createUser:', createError);
      return NextResponse.json(
        { ok: false, message: 'Erreur création utilisateur.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, user: newUser.user },
      { status: 200 }
    );
  } catch (e) {
    console.error('Erreur /api/admin/create-user:', e);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
