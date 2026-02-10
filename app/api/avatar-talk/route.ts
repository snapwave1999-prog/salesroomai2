// app/api/avatar-talk/route.ts
import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

type Body = {
  salesroomId?: string;
  title?: string;
  subtitle?: string;
  style?: "decouverte" | "agressif" | "conseiller";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Body | null;

    const salesroomId = body?.salesroomId ?? "inconnu";
    const title = body?.title ?? "";
    const subtitle = body?.subtitle ?? "";
    const style = body?.style ?? "decouverte";

    const descriptionPart = [title, subtitle].filter(Boolean).join(" — ");

    // Fallback sans clé OpenAI
    if (!OPENAI_API_KEY) {
      const base = descriptionPart
        ? `Voici une offre : ${descriptionPart}`
        : `Bonjour, je suis l'avatar de la salle ${salesroomId}.`;
      return NextResponse.json(
        {
          text: `${base} (OPENAI_API_KEY manquant, message statique.)`,
        },
        { status: 200 }
      );
    }

    // Instructions selon le style
    let styleInstruction: string;

    switch (style) {
      case "agressif":
        styleInstruction =
          "Adopte un ton dynamique et orienté vente, crée un sentiment d'urgence (ex: disponibilité limitée, promotion en cours), mais reste professionnel et crédible, sans agressivité excessive.";
        break;
      case "conseiller":
        styleInstruction =
          "Adopte un ton posé et rassurant, comme un conseiller honnête qui aide le client à prendre une bonne décision à long terme. Mets en avant la fiabilité, la valeur et la tranquillité d'esprit.";
        break;
      case "decouverte":
      default:
        styleInstruction =
          "Adopte un ton enthousiaste mais naturel, comme un conseiller sympa qui fait découvrir une nouvelle offre.";
        break;
    }

    const prompt = `
Tu es un conseiller commercial virtuel qui parle français.
Tu présentes cette offre : ${descriptionPart || "(aucune info précise)"}.

Objectif :
- Faire un pitch oral très court pour un client qui découvre cette offre pour la première fois.
- Maximum 2 phrases, 60 mots au total.
- Mets en avant 2 ou 3 bénéfices concrets adaptés à l'offre (exemples possibles : confort, économie, gain de temps, simplicité, sécurité, fiabilité, performance, résultats pour le client).
- Termine par une phrase qui donne envie d'en savoir plus ou de passer à l'action (sans poser de question directe).

Style demandé :
${styleInstruction}

Contraintes :
- Ne tutoie jamais le client, utilise le vouvoiement.
- Pas d'emojis, pas de liste à puces, pas de texte marketing cliché.
- Le ton doit rester crédible, comme un vrai conseiller expérimenté qui connaît bien l'offre.
- Si le descriptif ne parle pas d'un véhicule, ne parle pas d'automobile ni de voiture.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Tu es un conseiller commercial expérimenté, tu parles français et tu restes naturel.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 160,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", errorText);
      return NextResponse.json(
        {
          text:
            "Impossible de générer le message de l'avatar (erreur OpenAI).",
        },
        { status: 200 }
      );
    }

    const json = await response.json();
    const text =
      json.choices?.[0]?.message?.content ??
      `Découvrez cette offre ${descriptionPart || ""}.`;

    return NextResponse.json({ text }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { text: "Erreur serveur lors de l'appel de l'avatar." },
      { status: 200 }
    );
  }
}




