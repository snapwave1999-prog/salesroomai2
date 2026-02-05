// app/api/notify-auction-result/route.ts
import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@/utils/supabase/server';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const fromNumber = process.env.TWILIO_FROM_NUMBER as string;
const toNumber = process.env.TWILIO_TO_NUMBER as string;

const client =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

type NotifyResultBody = {
  pitchId?: number;
};

export async function POST(request: Request) {
  try {
    if (!client) {
      return NextResponse.json(
        { ok: false, message: 'Twilio non configuré.' },
        { status: 500 }
      );
    }

    const body: NotifyResultBody = await request.json();
    const { pitchId } = body;

    if (!pitchId) {
      return NextResponse.json(
        { ok: false, message: 'pitchId est obligatoire.' },
        { status: 400 }
      );
    }

    const pitchIdNum = Number(pitchId);
    if (Number.isNaN(pitchIdNum)) {
      return NextResponse.json(
        { ok: false, message: 'pitchId invalide.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1) Récupérer le pitch
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, "Titre", auction_status')
      .eq('id', pitchIdNum)
      .single();

    if (pitchError || !pitch) {
      console.error('Erreur fetch pitch pour notify result:', pitchError);
      return NextResponse.json(
        { ok: false, message: 'Pitch introuvable pour cet ID.' },
        { status: 404 }
      );
    }

    // 2) Récupérer la meilleure offre
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('amount, bidder, created_at')
      .eq('pitch_id', pitchIdNum)
      .order('amount', { ascending: false })
      .limit(1);

    if (offersError) {
      console.error('Erreur fetch offers pour notify result:', offersError);
    }

    const bestOffer = offers && offers.length > 0 ? offers[0] : null;

    const title = pitch.Titre || `(Pitch #${pitch.id})`;
    const statusText =
      pitch.auction_status === 'closed' ? 'FERMÉ' : pitch.auction_status || 'N/C';

    let bodyLines: string[] = [
      'ENCAN TERMINÉ',
      `Titre : ${title}`,
      `Statut : ${statusText}`,
    ];

    if (bestOffer) {
      bodyLines.push(
        `Gagnant : ${bestOffer.bidder || 'Anonyme'} – ${bestOffer.amount} $`
      );
      bodyLines.push(
        `À : ${new Date(bestOffer.created_at).toLocaleString()}`
      );
    } else {
      bodyLines.push('Aucune offre sur cet encan.');
    }

    const text = bodyLines.join('\n');

    const msg = await client.messages.create({
      body: text,
      from: fromNumber,
      to: toNumber,
    });

    console.log('SMS résultat encan envoyé, SID :', msg.sid);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Erreur notify-auction-result:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur lors de l’envoi du SMS de résultat.' },
      { status: 500 }
    );
  }
}
