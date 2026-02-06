import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeSecretKey) {
  console.error(
    'STRIPE_SECRET_KEY manquant pour /api/auction-checkout. Ajoute-le dans .env.local.'
  );
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Env manquantes pour /api/auction-checkout : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.'
  );
}

// Stripe initialisé avec la bonne apiVersion
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-01-28.clover',
    })
  : null;

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
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe non configuré côté serveur.' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.auction_order_id !== 'string' ||
      !body.auction_order_id.trim()
    ) {
      return NextResponse.json(
        { error: 'Champ "auction_order_id" requis dans le body.' },
        { status: 400 }
      );
    }

    const orderId = body.auction_order_id.trim();
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const supabase = getAdminSupabase();

    // 1) Récupérer l'ordre d'encan
    const { data: order, error: orderError } = await supabase
      .from('auction_orders')
      .select(
        'id, auction_id, salesroom_id, winner_name, winner_bid_amount, status'
      )
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      console.error('Erreur lecture auction_orders:', orderError);
      return NextResponse.json(
        { error: 'Erreur lecture auction_orders.' },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Ordre introuvable.' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json(
        {
          error:
            'Cet ordre n’est pas en statut pending_payment, impossible de créer un paiement.',
        },
        { status: 400 }
      );
    }

    const amountNumber = Number(order.winner_bid_amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return NextResponse.json(
        { error: 'Montant gagnant invalide pour cet ordre.' },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(amountNumber * 100);

    // 2) Créer la Checkout Session Stripe (paiement one-shot)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `Paiement encan #${order.auction_id}`,
              description: order.winner_name
                ? `Gagnant: ${order.winner_name}`
                : 'Paiement gagnant encan',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      client_reference_id: order.id,
      success_url: `${origin}/salesroom/payment-success?orderId=${
        order.id
      }&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/salesroom/payment-cancelled?orderId=${order.id}`,
    }); // [web:619]

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error('Erreur /api/auction-checkout:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur interne /api/auction-checkout.' },
      { status: 500 }
    );
  }
}

