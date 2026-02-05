import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { Titre, Texte, Type, price, status } = body;

    if (!Titre) {
      return NextResponse.json(
        { ok: false, message: 'Titre obligatoire.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.from('pitches').insert([
      {
        Titre,
        Texte,
        Type,
        price: Number(price || 0),
        status: status || 'Froid',
      },
    ]);

    if (error) {
      console.error('Erreur insert pitch:', error);
      return NextResponse.json(
        { ok: false, message: "Erreur lors de l'insertion du pitch." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err) {
    console.error('Erreur API create-pitch:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
