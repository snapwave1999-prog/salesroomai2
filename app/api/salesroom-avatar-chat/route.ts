// app/api/salesroom-avatar-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, profile } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Messages manquants.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, message: 'OPENAI_API_KEY manquant dans .env.local.' },
        { status: 500 }
      );
    }

    // Choix du style de client selon le profil
    let persona = '';
    switch (profile) {
      case 'chasseur_rabais':
        persona =
          "Tu es un client TRÈS sensible au prix, tu veux toujours négocier, tu compares avec d'autres vendeurs, tu cherches le meilleur deal possible.";
        break;
      case 'presse':
        persona =
          "Tu es un client pressé, tu n’as pas beaucoup de temps, tu vas droit au but et tu veux des réponses courtes, claires et des next steps rapides.";
        break;
      case 'passionne_auto':
        persona =
          "Tu es un client très passionné de voitures, surtout les muscle cars et classiques, tu poses des questions techniques (moteur, restauration, historique).";
        break;
      default:
        persona =
          "Tu es un client potentiel au Québec, réaliste, parfois hésitant, parfois intéressé, tu poses des questions logiques et fais quelques objections.";
        break;
    }

    const systemPrompt =
      persona +
      " Tu restes dans un contexte d'appel de vente, en français québécois, réponses courtes (2 à 4 phrases), et tu joues vraiment le rôle du client, pas du coach.";

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erreur OpenAI avatar:', errText);
      return NextResponse.json(
        { ok: false, message: 'Erreur IA avatar.' },
        { status: 500 }
      );
    }

    const json = await response.json();
    const reply =
      json.choices?.[0]?.message?.content?.toString().trim() ?? '';

    if (!reply) {
      return NextResponse.json(
        { ok: false, message: 'Réponse IA vide.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, reply },
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur /api/salesroom-avatar-chat:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

