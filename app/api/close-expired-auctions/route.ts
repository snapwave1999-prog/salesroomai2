// app/api/close-expired-auctions/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST() {
  try {
    const now = new Date().toISOString();

    // 1) Récupérer tous les encans expirés encore "open"
    const { data: expiredPitches, error } = await supabaseAdmin
      .from('pitches')
      .select('id')
      .eq('auction_status', 'open')
      .lte('ends_at', now);

    if (error) {
      console.error('Erreur fetch encans expirés:', error);
      return NextResponse.json(
        { ok: false, message: 'Erreur lors de la recherche des encans expirés.' },
        { status: 500 }
      );
    }

    if (!expiredPitches || expiredPitches.length === 0) {
      return NextResponse.json(
        { ok: true, message: 'Aucun encan expiré à fermer.', count: 0 },
        { status: 200 }
      );
    }

    const ids = expiredPitches.map((p) => p.id);

    // 2) Mettre à jour le statut à 'closed' pour tous
    const { error: updateError } = await supabaseAdmin
      .from('pitches')
      .update({ auction_status: 'closed' })
      .in('id', ids);

    if (updateError) {
      console.error('Erreur mise à jour encans expirés:', updateError);
      return NextResponse.json(
        { ok: false, message: 'Erreur lors de la fermeture des encans.' },
        { status: 500 }
      );
    }

    // 3) Envoyer le SMS de résultat pour chaque encan fermé
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    await Promise.all(
      ids.map(async (pitchId: number) => {
        try {
          const res = await fetch(`${baseUrl}/api/notify-auction-result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pitchId }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            console.error(
              'Erreur notify-auction-result pour pitch',
              pitchId,
              res.status,
              data
            );
          }
        } catch (err) {
          console.error(
            'Erreur appel notify-auction-result pour pitch',
            pitchId,
            err
          );
        }
      })
    );

    return NextResponse.json(
      {
        ok: true,
        message: `Encans expirés fermés et notifications envoyées (${ids.length}).`,
        count: ids.length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur close-expired-auctions:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}


