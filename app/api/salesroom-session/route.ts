// app/api/salesroom-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
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

    const { profile, messageCount, notes } = await req.json();

    if (!profile) {
      return NextResponse.json(
        { ok: false, message: 'Profil manquant.' },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from('salesroom_sessions')
      .insert({
        user_id: user.id,
        profile,
        message_count: messageCount ?? 0,
        notes: notes ?? null,
      });

    if (insertError) {
      console.error('Erreur insert session:', insertError);
      return NextResponse.json(
        { ok: false, message: 'Erreur enregistrement session.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Erreur /api/salesroom-session:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
