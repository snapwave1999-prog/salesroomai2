import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Env manquantes pour /api/offers : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.'
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.roomId !== 'string' ||
      typeof body.amount !== 'number'
    ) {
      return NextResponse.json(
        { error: 'roomId (string) et amount (number) sont requis.' },
        { status: 400 }
      );
    }

    const { roomId, amount, bidderName } = body;

    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from('offers')
      .insert({
        room_id: roomId,
        amount,
        bidder_name: bidderName || null,
      })
      .select('id, room_id, amount, bidder_name, created_at')
      .single();

    if (error) {
      console.error('Insert offers error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ offer: data }, { status: 200 });
  } catch (err: any) {
    console.error('Erreur interne /api/offers:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur interne.' },
      { status: 500 }
    );
  }
}








