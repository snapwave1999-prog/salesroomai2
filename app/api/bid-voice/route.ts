import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.text !== 'string' || !body.text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Champ "text" manquant ou invalide.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const text = body.text.trim();
    const voice =
      typeof body.voice === 'string' && body.voice.trim()
        ? body.voice.trim()
        : 'alloy';

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'OPENAI_API_KEY manquant dans les variables d’environnement.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const ttsResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
      // pas de `format`, le SDK renvoie déjà un body/stream binaire valide
    });

    // Dans la v4+ du SDK, on peut renvoyer directement le body de la réponse
    // sans repasser par Buffer.
    // @ts-ignore – .body existe bien à l’exécution
    return new Response(ttsResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Erreur /api/bid-voice:', error);
    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      'Erreur interne.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}



