// app/api/auction-finalize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export const runtime = "nodejs";

/**
 * Cette route reçoit:
 * - auction_id: string
 *
 * Elle:
 * 1) vérifie que l'encan existe,
 * 2) récupère la meilleure mise,
 * 3) crée une entrée dans "payments" (si tu as cette table),
 * 4) met à jour l'encan en "pending_payment".
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    console.log("🚩 /api/auction-finalize body reçu:", body);

    if (!body || typeof body.auction_id !== "string") {
      const errorPayload = {
        error: "Champ requis: auction_id (string).",
      };
      console.error("❌ /api/auction-finalize validation error:", errorPayload);
      return NextResponse.json(errorPayload, { status: 400 });
    }

    const { auction_id } = body;

    // 1) Lire l’encan
    const { data: auction, error: auctionError } = await supabaseAdmin
      .from("auctions")
      .select("id, status, salesroom_id, current_price, currency")
      .eq("id", auction_id)
      .maybeSingle();

    console.log("🔎 auction trouvé:", { auction, auctionError });

    if (auctionError) {
      const errorPayload = {
        error: `Erreur lecture auctions: ${auctionError.message}`,
      };
      console.error("❌ /api/auction-finalize auctions error:", errorPayload);
      return NextResponse.json(errorPayload, { status: 500 });
    }

    if (!auction) {
      const errorPayload = {
        error: "Encan introuvable pour cet auction_id.",
      };
      console.error("❌ /api/auction-finalize no auction:", errorPayload);
      return NextResponse.json(errorPayload, { status: 404 });
    }

    // 2) Lire toutes les mises de cet encan et trouver la meilleure
    const { data: bids, error: bidsError } = await supabaseAdmin
      .from("bids")
      .select("id, auction_id, amount, bidder_id, created_at")
      .eq("auction_id", auction_id)
      .order("amount", { ascending: false });

    console.log("🔎 bids trouvées:", { count: bids?.length ?? 0, bidsError });

    if (bidsError) {
      const errorPayload = {
        error: `Erreur lecture bids: ${bidsError.message}`,
      };
      console.error("❌ /api/auction-finalize bids error:", errorPayload);
      return NextResponse.json(errorPayload, { status: 500 });
    }

    if (!bids || bids.length === 0) {
      const errorPayload = {
        error:
          "Aucune mise trouvée pour cet encan, impossible de créer un gagnant.",
      };
      console.error("❌ /api/auction-finalize no bids:", errorPayload);
      return NextResponse.json(errorPayload, { status: 400 });
    }

    const bestBid = bids[0];

    console.log("🏆 meilleure mise retenue:", { bestBid });

    // 3) (Optionnel) Créer un enregistrement dans payments
    // Si tu as une table "payments", on en crée une entrée simple.
    let paymentRecord = null;
    const { data: createdPayment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        auction_id,
        user_id: bestBid.bidder_id,
        amount: bestBid.amount,
        currency: auction.currency || "usd",
        status: "pending", // sera mis à jour à "paid" après webhook Stripe ou autre
      })
      .select("*")
      .maybeSingle();

    if (paymentError) {
      console.error(
        "❌ /api/auction-finalize payments insert error:",
        paymentError
      );
    } else {
      paymentRecord = createdPayment;
    }

    // 4) Mettre à jour l'encan: winner_bid_id + status 'pending_payment'
    const { error: updateAuctionError } = await supabaseAdmin
      .from("auctions")
      .update({
        status: "pending_payment",
        winner_bid_id: bestBid.id,
        current_price: bestBid.amount,
      })
      .eq("id", auction_id);

    if (updateAuctionError) {
      const errorPayload = {
        error: `Erreur mise à jour auctions: ${updateAuctionError.message}`,
      };
      console.error(
        "❌ /api/auction-finalize auctions update error:",
        errorPayload
      );
      return NextResponse.json(errorPayload, { status: 500 });
    }

    const successPayload = {
      auction_id,
      winner_bid_id: bestBid.id,
      winner_bid_amount: bestBid.amount,
      payment: paymentRecord,
    };

    console.log("✅ /api/auction-finalize succès:", successPayload);
    return NextResponse.json(successPayload, { status: 200 });
  } catch (err: any) {
    const errorPayload = {
      error:
        err?.message || "Erreur interne inconnue dans /api/auction-finalize.",
    };
    console.error("💥 /api/auction-finalize exception:", err);
    return NextResponse.json(errorPayload, { status: 500 });
  }
}



