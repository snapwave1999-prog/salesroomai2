// app/api/auction-checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/utils/supabase/admin";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { auctionId } = body || {};

    if (!auctionId || typeof auctionId !== "string") {
      return NextResponse.json(
        { error: "auctionId manquant ou invalide" },
        { status: 400 }
      );
    }

    // 1) Charger l'encan (id réel = colonne demo)
    const { data: auctionRow, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("demo, salesroom_id, status, start_price, winning_amount")
      .eq("demo", auctionId)
      .maybeSingle();

    if (auctionError) {
      console.error("[auction-checkout] Error loading auction:", auctionError);
      return NextResponse.json(
        { error: "Erreur lecture encan" },
        { status: 500 }
      );
    }

    if (!auctionRow) {
      return NextResponse.json(
        { error: "Encan introuvable pour cet auctionId (demo)." },
        { status: 404 }
      );
    }

    // 2) Charger la SalesRoom liée (sans currency)
    const { data: salesroomRow, error: salesroomError } = await supabaseAdmin
      .from("salesrooms")
      .select("id, title")
      .eq("id", auctionRow.salesroom_id)
      .maybeSingle();

    if (salesroomError) {
      console.error(
        "[auction-checkout] Error loading salesroom:",
        salesroomError
      );
      return NextResponse.json(
        { error: "Erreur lecture SalesRoom" },
        { status: 500 }
      );
    }

    if (!salesroomRow) {
      return NextResponse.json(
        { error: "SalesRoom liée introuvable." },
        { status: 404 }
      );
    }

    // 3) Montant à facturer (winning_amount prioritaire si présent)
    const amount =
      auctionRow.winning_amount && auctionRow.winning_amount > 0
        ? auctionRow.winning_amount
        : auctionRow.start_price;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Montant invalide pour cet encan" },
        { status: 400 }
      );
    }

    // Devise forcée (car pas de colonne currency)
    const currency = "cad";

    // 4) Création de la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: salesroomRow.title || "Encan SalesRoomAI",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/salesroom/payment-success?auctionId=${auctionId}`,
      cancel_url: `${BASE_URL}/salesroom?salesroomId=${salesroomRow.id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[auction-checkout] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur serveur pendant la création de la session Stripe" },
      { status: 500 }
    );
  }
}




