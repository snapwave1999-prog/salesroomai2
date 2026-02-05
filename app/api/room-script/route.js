// app/api/room-script/route.js

import OpenAI from 'openai';
import twilio from 'twilio';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// On crée le client Twilio seulement si les variables sont présentes
const hasTwilioConfig =
  !!process.env.TWILIO_ACCOUNT_SID &&
  !!process.env.TWILIO_AUTH_TOKEN &&
  !!process.env.TWILIO_FROM_NUMBER &&
  !!process.env.TWILIO_TO_NUMBER;

const twilioClient = hasTwilioConfig
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(request) {
  try {
    const body = await request.json();
    const script = body?.script || '';

    if (!script || typeof script !== 'string') {
      return new Response(
        JSON.stringify({
          ok: false,
          message: 'Script manquant ou invalide.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let improved = script;
    let aiUsed = false;

    // 1) IA : amélioration du script si OPENAI_API_KEY est définie
    if (process.env.OPENAI_API_KEY) {
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              "Tu es un expert en vente et en rédaction persuasive en français québécois, ton style est simple, concret et naturel, sans jargon compliqué.",
          },
          {
            role: 'user',
            content:
              "Voici le script d’un opérateur pour une salle de vente en ligne (SalesRoomAI). " +
              "Améliore-le légèrement pour qu’il soit clair, chaleureux et convaincant, " +
              "sans le rallonger inutilement, et garde le tutoiement si présent. " +
              "Renvoie uniquement le script final, sans commentaire autour.\n\n" +
              "Script d’origine :\n\n" +
              script,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      improved =
        completion?.choices?.[0]?.message?.content?.trim() || script;
      aiUsed = true;
    } else {
      console.warn(
        'OPENAI_API_KEY manquante, script envoyé sans amélioration IA.'
      );
    }

    console.log('SCRIPT ORIGINAL :');
    console.log(script);
    console.log('SCRIPT UTILISÉ POUR SMS (IMPROVED/ORIGINAL) :');
    console.log(improved);

    // 2) Twilio : envoi SMS si config OK
    let smsStatus = 'twilio_not_configured';

    if (hasTwilioConfig && twilioClient) {
      try {
        const message = await twilioClient.messages.create({
          body: improved,
          from: process.env.TWILIO_FROM_NUMBER,
          to: process.env.TWILIO_TO_NUMBER,
        });

        console.log('SMS envoyé via Twilio, SID:', message.sid);
        smsStatus = 'sent';
      } catch (err) {
        console.error('Erreur lors de lenvoi SMS Twilio :', err);
        smsStatus = 'error';
      }
    } else {
      console.warn(
        'Configuration Twilio incomplète, SMS non envoyé (TWILIO_* manquants).'
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message:
          aiUsed
            ? "Script reçu, amélioré par l’IA et envoyé (ou tenté) via Twilio."
            : "Script reçu (IA désactivée) et envoyé (ou tenté) via Twilio.",
        original: script,
        improved,
        smsStatus,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('Erreur room-script API:', e);
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Erreur lors du traitement IA/Twilio.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}





