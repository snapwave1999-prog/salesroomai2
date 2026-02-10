import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Supabase non configuré" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { error } = await supabase.rpc("close_expired_auctions");
    if (error) {
      console.error("Erreur RPC close_expired_auctions:", error);
      return NextResponse.json(
        { error: "Erreur lors de la fermeture des encans" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Exception close_expired_auctions:", e);
    return NextResponse.json(
      { error: "Exception lors de la fermeture des encans" },
      { status: 500 }
    );
  }
}
