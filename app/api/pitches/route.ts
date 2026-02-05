// app/api/pitches/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type CreatePitchBody = {
  titre?: string;
  description?: string;
  durationMinutes?: number;
  startingBid?: number | null;
};

export async function POST(request: Request) {
  try {
    const body: CreatePitchBody = await request.json();
    const { titre, description, durationMinutes, startingBid } = body;

    if (!titre || !description || !durationMinutes) {
      return NextResponse.json(
        {
          ok: false,
          message:
            'Les champs titre, description et durationMinutes sont obligatoires.',
        },
        { status: 400 }
      );
    }

    const duration = Number(durationMinutes);
    if (Number.isNaN(duration) || duration <= 0) {
      return NextResponse.json(
        {
          ok: false,
          message: 'durationMinutes doit être un nombre strictement positif.',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const now = new Date();
    const endsAt = new Date(now.getTime() + duration * 60 * 1000);

    const { data, error } = await supabase
      .from('pitches')
      .insert([
        {
          Titre: titre,
          Texte: description,
          auction_status: 'open',
          ends_at: endsAt.toISOString(),
          starting_bid:
            startingBid != null ? Number(startingBid) : null,
        },
      ])
      .select(
        'id, "Titre", "Texte", auction_status, ends_at, starting_bid'
      )
      .single();

    if (error) {
      console.error('Erreur insert pitch:', error);
      return NextResponse.json(
        {
          ok: false,
          message: "Erreur lors de la création de l'encan.",
        },
        { status: 500 }
      );
    }

    // Notification SMS Twilio (fire-and-forget)
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      const roomUrl = `${baseUrl}/room2?id=${data.id}`;

      fetch(`${baseUrl}/api/notify-new-auction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitchId: data.id,
          titre,
          url: roomUrl,
        }),
      }).catch((err) =>
        console.error('Erreur appel notify-new-auction:', err)
      );
    } catch (e) {
      console.error('Erreur préparation notification SMS:', e);
    }

    return NextResponse.json(
      {
        ok: true,
        data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Erreur API /api/pitches:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}



