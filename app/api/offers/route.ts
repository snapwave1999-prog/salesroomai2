// app/api/offers/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pitchId, amount, bidder } = body;

    if (!pitchId || !amount) {
      return NextResponse.json(
        { ok: false, message: 'pitchId et amount sont obligatoires.' },
        { status: 400 }
      );
    }

    const pitchIdNum = Number(pitchId);
    const amountNum = Number(amount);

    if (Number.isNaN(pitchIdNum) || Number.isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { ok: false, message: 'pitchId et amount doivent être valides.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1) Récupérer le pitch avec statut + ends_at + mise de départ
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, auction_status, ends_at, starting_bid')
      .eq('id', pitchIdNum)
      .single();

    if (pitchError || !pitch) {
      console.error('Erreur fetch pitch pour offers:', pitchError);
      return NextResponse.json(
        { ok: false, message: 'Pitch introuvable pour cet ID.' },
        { status: 404 }
      );
    }

    const now = new Date();
    const endsAt = pitch.ends_at ? new Date(pitch.ends_at) : null;

    // 2) Si ends_at est dépassé → fermer l'encan en base et refuser la mise
    if (endsAt && now > endsAt) {
      const { error: closeError } = await supabase
        .from('pitches')
        .update({ auction_status: 'closed' })
        .eq('id', pitchIdNum);

      if (closeError) {
        console.error(
          'Erreur mise à jour auction_status à closed:',
          closeError
        );
      }

      return NextResponse.json(
        {
          ok: false,
          message:
            "L'encan est terminé (heure de fin dépassée). Impossible d'ajouter une offre.",
        },
        { status: 403 }
      );
    }

    // 3) Si l'encan n'est pas marqué 'open' → refuser
    if (pitch.auction_status && pitch.auction_status !== 'open') {
      return NextResponse.json(
        {
          ok: false,
          message:
            "L'encan est fermé pour ce pitch. Impossible d'ajouter une offre.",
        },
        { status: 403 }
      );
    }

    // 4) Encan encore ouvert → vérifier minimum autorisé
    // Récupérer la meilleure offre actuelle
    const { data: existingOffers, error: offersError } = await supabase
      .from('offers')
      .select('amount')
      .eq('pitch_id', pitchIdNum)
      .order('amount', { ascending: false })
      .limit(1);

    if (offersError) {
      console.error('Erreur fetch offres pour min:', offersError);
    }

    const currentMax = existingOffers?.[0]?.amount ?? null;
    const startingBidValue = pitch.starting_bid ?? null;

    let minRequired = 0;
    if (currentMax != null) {
      minRequired = Number(currentMax);
    } else if (startingBidValue != null) {
      minRequired = Number(startingBidValue);
    }

    if (amountNum <= minRequired) {
      return NextResponse.json(
        {
          ok: false,
          message:
            minRequired > 0
              ? `La mise doit être strictement supérieure à ${minRequired} $.`
              : 'Montant de mise invalide.',
        },
        { status: 400 }
      );
    }

    // 5) Encan encore ouvert et mise suffisante → insertion de la mise
    const { data, error } = await supabase
      .from('offers')
      .insert([
        {
          pitch_id: pitchIdNum,
          amount: amountNum,
          bidder: bidder || null,
        },
      ])
      .select(); // renvoyer la/les lignes insérées

    if (error) {
      console.error('Erreur insert offer:', error);
      return NextResponse.json(
        { ok: false, message: "Erreur lors de l'insertion de l'offre." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (err) {
    console.error('Erreur API offers:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}







