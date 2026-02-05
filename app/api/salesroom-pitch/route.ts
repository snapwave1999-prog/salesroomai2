// app/api/salesroom-pitch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, message: 'ID manquant.' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: room, error } = await supabase
      .from('salesrooms')
      .select('title, subtitle, price, year, mileage_km')
      .eq('id', id)
      .single();

    if (error || !room) {
      return NextResponse.json(
        { ok: false, message: 'SalesRoom introuvable.' },
        { status: 404 }
      );
    }

    const pitchPrompt = `
Tu es un vendeur auto très convaincant au Québec.
Génère un pitch oral court (5-7 phrases) en français, ton chaleureux et simple,
pour vendre ce véhicule :

Titre : ${room.title ?? ''}
Sous-titre : ${room.subtitle ?? ''}
Prix : ${room.price ?? 'inconnu'} $
Année : ${room.year ?? 'inconnue'}
Kilométrage : ${room.mileage_km ?? 'inconnu'} km

Ne rajoute pas d'emoji, pas de mise en forme, juste le texte du pitch.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'Tu es un expert en vente automobile.' },
        { role: 'user', content: pitchPrompt },
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content ?? '';

    return NextResponse.json({ ok: true, pitch: content });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message || 'Erreur IA.' },
      { status: 500 }
    );
  }
}

