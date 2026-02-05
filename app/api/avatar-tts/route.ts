// app/api/avatar-tts/route.ts
import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const text: string = body?.text ?? '';

    if (!text) {
      return NextResponse.json(
        { error: 'Texte manquant' },
        { status: 400 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY manquant' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://api.openai.com/v1/audio/speech',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts', // modèle TTS OpenAI
          voice: 'alloy',          // voix par défaut
          format: 'mp3',
          input: text,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS error:', errorText);
      return NextResponse.json(
        { error: 'Erreur TTS OpenAI' },
        { status: 500 }
      );
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const base64 = audioBuffer.toString('base64');
    const dataUrl = `data:audio/mp3;base64,${base64}`;

    return NextResponse.json({ audioUrl: dataUrl }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Erreur serveur TTS' },
      { status: 500 }
    );
  }
}
