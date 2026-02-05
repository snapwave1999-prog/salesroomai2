// app/api/avatar-talk/route.ts
import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const salesroomId = body?.salesroomId ?? 'inconnu';
    const title = body?.title ?? '';
    const subtitle = body?.subtitle ?? '';

    if (!OPENAI_API_KEY) {
      const base = title || subtitle
        ? `Voici un véhicule : ${title} ${subtitle}`.trim()
        : `Bonjour, je suis l'avatar de la salle ${salesroomId}.`;
      return NextResponse.json(
        { text: `${base} (OPENAI_API_KEY manquant, message statique.)` },
        { status: 200 }
      );
    }

    const descriptionPart = [title, subtitle].filter(Boolean).join(' — ');

    const prompt = `
Tu es un vendeur automobile virtuel.
Tu présentes ce véhicule: ${descriptionPart || '(aucune info précise)' }.
Fais un pitch court et percutant (2 phrases max), en français, ton enthousiaste mais crédible, sans emojis ni tutoiement.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un conseiller en vente automobile qui parle français.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 140,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      return NextResponse.json(
        { text: `Impossible de générer le message de l'avatar (erreur OpenAI).` },
        { status: 200 }
      );
    }

    const json = await response.json();
    const text =
      json.choices?.[0]?.message?.content ??
      `Découvrez ce véhicule ${descriptionPart || ''}.`;

    return NextResponse.json({ text }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { text: "Erreur serveur lors de l'appel de l'avatar." },
      { status: 200 }
    );
  }
}


