import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Env manquantes pour /api/auction-finalize : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.'
  );
}

function getAdminSupabase() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase admin non configuré : vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    console.log('🚩 /api/auction-finalize body reçu:', body);

    if (
      !body ||
      typeof body.auction_id !== 'string' ||
      typeof body.salesroom_id !== 'string'
    ) {
      const errorPayload = {
        error:
          'Champs requis: auction_id (string) et salesroom_id (string).',
      };
      console.error('❌ /api/auction-finalize validation error:', errorPayload);
      return NextResponse.json(errorPayload, { status: 400 });
    }

    const { auction_id, salesroom_id } = body;
    const supabase = getAdminSupabase();

    // 1) Lire l’encan
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select(
        'demo, salesroom_id, status, start_price, reserve_price, ends_at, created_at'
      )
      .eq('demo', auction_id)
      .maybeSingle();

    console.log('🔎 auction trouvé:', { auction, auctionError });

    if (auctionError) {
      const errorPayload = {
        error: `Erreur lecture auctions: ${auctionError.message}`,
      };
      console.error('❌ /api/auction-finalize auctions error:', errorPayload);
      return NextResponse.json(errorPayload, { status: 500 });
    }

    if (!auction) {
      const errorPayload = {
        error: 'Encan introuvable pour cet auction_id.',
      };
      console.error('❌ /api/auction-finalize no auction:', errorPayload);
      return NextResponse.json(errorPayload, { status: 404 });
    }

    if (auction.salesroom_id !== salesroom_id) {
      const errorPayload = {
        error:
          'Cet encan n’appartient pas à la SalesRoom fournie (salesroom_id mismatch).',
      };
      console.error('❌ /api/auction-finalize salesroom mismatch:', {
        auction_salesroom_id: auction.salesroom_id,
        body_salesroom_id: salesroom_id,
      });
      return NextResponse.json(errorPayload, { status: 400 });
    }

    // 2) Lire toutes les mises de cet encan
    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select('id, auction_id, amount, bidder_name, created_at')
      .eq('auction_id', auction_id)
      .order('amount', { ascending: false });

    console.log('🔎 bids trouvées:', { count: bids?.length ?? 0, bidsError });

    if (bidsError) {
      const errorPayload = {
        error: `Erreur lecture bids: ${bidsError.message}`,
      };
      console.error('❌ /api/auction-finalize bids error:', errorPayload);
      return NextResponse.json(errorPayload, { status: 500 });
    }

    if (!bids || bids.length === 0) {
      const errorPayload = {
        error:
          'Aucune mise trouvée pour cet encan, impossible de créer un ordre gagnant.',
      };
      console.error('❌ /api/auction-finalize no bids:', errorPayload);
      return NextResponse.json(errorPayload, { status: 400 });
    }

    const bestBid = bids[0];
    const winner_name = bestBid.bidder_name || null;
    const winner_bid_amount = bestBid.amount;

    console.log('🏆 meilleure mise retenue:', { bestBid });

    // 3) Créer un ordre d’encan (auction_orders)
    const { data: order, error: orderError } = await supabase
      .from('auction_orders')
      .insert({
        auction_id,
        salesroom_id,
        winner_name,
        winner_bid_amount,
        status: 'pending_payment',
      })
      .select(
        'id, auction_id, salesroom_id, winner_name, winner_bid_amount, status, created_at'
      )
      .single();

    console.log('🧾 résultat insertion auction_orders:', {
      order,
      orderError,
    });

    if (orderError) {
      const errorPayload = {
        error: `Erreur insertion auction_orders: ${orderError.message}`,
      };
      console.error(
        '❌ /api/auction-finalize auction_orders insert error:',
        errorPayload
      );
      return NextResponse.json(errorPayload, { status: 500 });
    }

    const successPayload = { order };
    console.log('✅ /api/auction-finalize succès:', successPayload);
    return NextResponse.json(successPayload, { status: 200 });
  } catch (err: any) {
    const errorPayload = {
      error:
        err?.message || 'Erreur interne inconnue dans /api/auction-finalize.',
    };
    console.error('💥 /api/auction-finalize exception:', err);
    return NextResponse.json(errorPayload, { status: 500 });
  }
}


