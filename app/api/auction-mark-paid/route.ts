import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Env manquantes pour /api/auction-mark-paid : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.'
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

    if (!body || typeof body.orderId !== 'string' || !body.orderId.trim()) {
      return NextResponse.json(
        { error: 'Champ "orderId" requis dans le body.' },
        { status: 400 }
      );
    }

    const orderId = body.orderId.trim();
    const supabase = getAdminSupabase();

    const { data: order, error: orderError } = await supabase
      .from('auction_orders')
      .select('id, status')
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

    if (order.status === 'paid') {
      return NextResponse.json(
        { status: 'already_paid' },
        { status: 200 }
      );
    }

    const { error: updateError } = await supabase
      .from('auction_orders')
      .update({ status: 'paid' })
      .eq('id', orderId);

    if (updateError) {
      console.error('Erreur update auction_orders:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du statut.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: 'paid' }, { status: 200 });
  } catch (err: any) {
    console.error('Erreur /api/auction-mark-paid:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur interne /api/auction-mark-paid.' },
      { status: 500 }
    );
  }
}
