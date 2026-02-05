// app/api/encan-place-bid/route.ts
import { NextResponse } from 'next/server';
import { createBrowserClient } from '@supabase/ssr';

function supabaseServer() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const auction_uuid = body.auction_uuid as string | undefined;
    const amountRaw = body.amount as string | number | undefined;

    if (!auction_uuid || amountRaw === undefined || amountRaw === null) {
      return NextResponse.json(
        { error: 'Données de mise invalides' },
        { status: 400 }
      );
    }

    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant de mise invalide' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { error } = await supabase.from('bids').insert({
      auction_uuid,
      amount,
      paddle_number: '101',
    });

    if (error) {
      console.error('Erreur insertion bid:', error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement de la mise" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erreur API encan-place-bid:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
