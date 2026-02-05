// app/api/salesroom/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = (body.title || '').trim();
    const subtitle = (body.subtitle || null) as string | null;
    const price = body.price ?? null;
    const year = body.year ?? null;
    const mileage_km = body.mileage_km ?? null;

    if (!title) {
      return NextResponse.json(
        { ok: false, message: 'Titre obligatoire.' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('salesrooms')
      .insert({
        title,
        subtitle,
        price,
        year,
        mileage_km,
      })
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          ok: false,
          message: error?.message || 'Erreur Supabase lors de la création.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message || 'Erreur serveur.' },
      { status: 500 }
    );
  }
}

