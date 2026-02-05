// app/api/close-auction/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

type CloseBody = {
  pitchId?: number;
};

export async function POST(request: Request) {
  try {
    const body: CloseBody = await request.json();
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

    // 1) Vérifier que le pitch existe
    const { data: pitch, error: pitchError } = await supabaseAdmin
      .from('pitches')
      .select('id, auction_status, ends_at')
      .eq('id', pitchIdNum)
      .maybeSingle();

    if (pitchError) {
      console.error('Erreur fetch pitch pour close-auction:', pitchError);
      return NextResponse.json(
        { ok: false, message: 'Erreur lors de la lecture du pitch.' },
        { status: 500 }
      );
    }

    if (!pitch) {
      return NextResponse.json(
        { ok: false, message: 'Pitch introuvable pour cet ID.' },
        { status: 404 }
      );
    }

    const now = new Date();
    const endsAt = pitch.ends_at ? new Date(pitch.ends_at) : null;

    // 2) Si déjà fermé
    if (pitch.auction_status === 'closed') {
      // On pourrait renvoyer OK sans refaire l'update
      return NextResponse.json(
        { ok: true, message: 'Encan déjà fermé.' },
        { status: 200 }
      );
    }

    if (endsAt && now < endsAt) {
      console.log('Fermeture avant la fin pour le pitch', pitchIdNum);
    }

    // 3) Mettre à jour le statut à 'closed'
    const { error: updateError } = await supabaseAdmin
      .from('pitches')
      .update({ auction_status: 'closed' })
      .eq('id', pitchIdNum);

    if (updateError) {
      console.error('Erreur update auction_status closed:', updateError);
      return NextResponse.json(
        { ok: false, message: 'Erreur lors de la fermeture de l’encan.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, message: 'Encan fermé (DB) avec succès.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur close-auction:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}







