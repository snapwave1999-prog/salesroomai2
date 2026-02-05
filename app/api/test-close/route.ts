// app/api/test-close/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const { pitchId } = await req.json();
    const id = Number(pitchId);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { ok: false, message: 'pitchId invalide.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pitches')
      .update({ auction_status: 'closed' })
      .eq('id', id)
      .select('id, auction_status');

    if (error) {
      console.error('Erreur test-close update:', error);
      return NextResponse.json(
        { ok: false, message: 'Erreur lors de la fermeture.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, rows: data },
      { status: 200 }
    );
  } catch (err) {
    console.error('Erreur test-close route:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    );
  }
}


