// app/api/auction-script/route.js

import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const auctionUuid = body?.auctionUuid;
    const script = body?.script;

    if (!auctionUuid || typeof auctionUuid !== 'string') {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "ID d'encan (auctionUuid) manquant ou invalide.",
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('auctions')
      .update({ operator_script_ai: script })
      .eq('uuid', auctionUuid)
      .select('uuid, operator_script_ai'); // plus de .single()

    if (error) {
      console.error('Erreur Supabase update auction:', error);
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Erreur lors de l'enregistrement dans l'encan.",
          supabaseError: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          message:
            "Aucun encan trouvé avec cet UUID. Vérifie que tu as bien collé l'uuid exact de la table auctions.",
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Script IA enregistré dans cet encan.',
        auction: data[0],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('Erreur auction-script API:', e);
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Erreur serveur lors de l'enregistrement du script.",
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}


