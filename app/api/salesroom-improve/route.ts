// app/api/salesroom-improve/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, mode } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'Texte manquant.' },
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

    const systemPrompt =
      'Tu es un expert en vente au téléphone au Québec. ' +
      'Tu réécris les scripts de vente pour les rendre plus clairs, plus convaincants et naturels. ' +
      'Tu réponds toujours en français, en gardant le sens mais en améliorant la formulation.';

    let userInstruction = 'Améliore ce script de vente.';
    if (mode === 'short') {
      userInstruction =
        'Rends ce script plus court et punché, tout en gardant les arguments principaux.';
    } else if (mode === 'objection') {
      userInstruction =
        'Réécris ce script en mettant l’accent sur la réponse à une objection fréquente du client.';
    }

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `${userInstruction}\n\nTexte original:\n${text}`,
        },
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
      console.error('Erreur OpenAI:', errText);
      return NextResponse.json(
        { ok: false, message: 'Erreur lors de la génération IA.' },
        { status: 500 }
      );
    }

    const json = await response.json();
    const improved =
      json.choices?.[0]?.message?.content?.toString().trim() ?? '';

    if (!improved) {
      return NextResponse.json(
        { ok: false, message: 'Réponse IA vide.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, improvedText: improved },
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur /api/salesroom-improve:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}
