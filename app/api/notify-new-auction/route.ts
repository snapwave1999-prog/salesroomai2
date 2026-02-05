// app/api/notify-new-auction/route.ts
import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const fromNumber = process.env.TWILIO_FROM_NUMBER as string;
const toNumber = process.env.TWILIO_TO_NUMBER as string; // ton cell perso

const client =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

type NotifyBody = {
  pitchId?: number;
  titre?: string;
  url?: string;
};

export async function POST(request: Request) {
  try {
    if (!client) {
      return NextResponse.json(
        { ok: false, message: 'Twilio non configuré.' },
        { status: 500 }
      );
    }

    const body: NotifyBody = await request.json();
    const { pitchId, titre, url } = body;

    if (!pitchId || !titre) {
      return NextResponse.json(
        {
          ok: false,
          message: 'pitchId et titre sont obligatoires pour la notification.',
        },
        { status: 400 }
      );
    }

    const messageText = [
      `NOUVEL ENCAN CRÉÉ`,
      `Titre : ${titre}`,
      url ? `Lien : ${url}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const msg = await client.messages.create({
      body: messageText,
      from: fromNumber,
      to: toNumber,
    });

    console.log('SMS Twilio envoyé, SID :', msg.sid);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Erreur Twilio notify-new-auction:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur lors de l’envoi du SMS.' },
      { status: 500 }
    );
  }
}
