// app/api/pitches-checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe côté serveur (clé secrète)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

// Helper pour valider les variables d'environnement
function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      pitchId?: number;
      salesroomId?: string;
      amount?: number;
      price?: number;
    } | null;

    if (!body || !body.pitchId) {
      return NextResponse.json(
        { error: "pitchId manquant dans le body." },
        { status: 400 }
      );
    }

    const pitchId = body.pitchId;
    const salesroomId = body.salesroomId ?? "unknown";

    // ICI: on utilise UNIQUEMENT ta variable NEXT_PUBLIC_BASE_URL
    const origin =
      req.headers.get("origin") ??
      assertEnv("NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL);

    // Montant optionnel reçu du front, sinon 2500 (= 25.00 CAD)
    const amount = body.amount ?? body.price ?? 2500;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `Pitch #${pitchId}`,
              metadata: {
                pitchId: String(pitchId),
                salesroomId,
              },
            },
            unit_amount: amount, // en cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        pitchId: String(pitchId),
        salesroomId,
      },
      success_url: `${origin}/payment-success?pitchId=${pitchId}`,
      cancel_url: `${origin}/payment-cancelled?pitchId=${pitchId}`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Session Stripe créée sans URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Erreur Stripe checkout:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erreur interne Stripe." },
      { status: 500 }
    );
  }
}

