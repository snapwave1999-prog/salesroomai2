// app/api/room2-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// On force la room de test à utiliser le pitch id = 10
const TEST_PITCH_ID = 10;

export async function GET(req: NextRequest) {
  try {
    const pitchId = TEST_PITCH_ID;

    // 1) Récupérer le pitch
    const { data: pitch, error: pitchError } = await supabase
      .from('pitches')
      .select('id, "Titre", "Texte", auction_status, ends_at')
      .eq('id', pitchId)
      .single();

    if (pitchError || !pitch) {
      console.error('Erreur Supabase pitch:', pitchError);
      return NextResponse.json(
        { ok: false, message: 'Encan introuvable.' },
        { status: 404 },
      );
    }

    // 2) Récupérer les offres (sans phone_number)
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('id, amount, created_at')
      .eq('pitch_id', pitchId)
      .order('created_at', { ascending: false });

    if (offersError) {
      console.error('Erreur Supabase offers:', offersError);
      return NextResponse.json(
        { ok: false, message: 'Erreur lors du chargement des offres.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: true, pitch, offers: offers || [] },
      { status: 200 },
    );
  } catch (err) {
    console.error('Erreur réseau /api/room2-data:', err);
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur lors du chargement de la salle.' },
      { status: 500 },
    );
  }
}




