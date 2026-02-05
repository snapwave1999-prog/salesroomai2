// app/api/salesroom-voice/route.ts
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
      return new NextResponse('ID manquant', { status: 400 });
    }

    const supabase = createClient();

    const { data: room, error } = await supabase
      .from('salesrooms')
      .select('title, subtitle, price, year, mileage_km')
      .eq('id', id)
      .single();

    if (error || !room) {
      return new NextResponse('SalesRoom introuvable', { status: 404 });
    }

    const text = `
Titre : ${room.title ?? ''}
Sous-titre : ${room.subtitle ?? ''}
Prix : ${room.price ?? 'inconnu'} dollars
Année : ${room.year ?? 'inconnue'}
Kilométrage : ${room.mileage_km ?? 'inconnu'} kilomètres

Fais un pitch oral court et chaleureux pour vendre ce véhicule.
`;

    const audio = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'coral',
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await audio.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      err.message || 'Erreur génération audio',
      { status: 500 }
    );
  }
}
