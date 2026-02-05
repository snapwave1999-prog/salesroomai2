// app/api/salesroom-feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Messages manquants.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, message: 'OPENAI_API_KEY manquant.' },
        { status: 500 }
      );
    }

    const coachPrompt =
      "Tu es un coach en vente B2C au Québec." +
      " On vient de te donner la transcription d'un jeu de rôle avec un client virtuel (texte)." +
      " Analyse UNIQUEMENT les messages de l'agent (role=user), pas ceux du client." +
      " Donne une réponse structurée en 3 parties, en français:" +
      "\n\n1) Points forts (3 puces courtes)." +
      "\n2) Points à améliorer (3 puces courtes)." +
      "\n3) Exemple de meilleure réponse à la DERNIÈRE objection du client (un seul paragraphe de 3 à 5 phrases)." +
      "\n\nReste concret et orienté closing (prochain pas, rendez-vous, dépôt, etc.).";

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: coachPrompt },
        ...messages,
      ],
      temperature: 0.5,
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
      console.error('Erreur OpenAI feedback:', errText);
      return NextResponse.json(
        { ok: false, message: 'Erreur IA feedback.' },
        { status: 500 }
      );
    }

    const json = await response.json();
    const feedback =
      json.choices?.[0]?.message?.content?.toString().trim() ?? '';

    if (!feedback) {
      return NextResponse.json(
        { ok: false, message: 'Feedback IA vide.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, feedback },
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur /api/salesroom-feedback:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

