// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-01-28.clover",
});

// En dev on force localhost:3000 pour éviter les soucis de variables.
const LOCAL_SITE_URL = "http://localhost:3000";

const PRICE_IDS: Record<string, string> = {
  pro: "price_1SvilrDkjSHw910oRKfKk0oD",
  premium: "price_1SvisODkjSHw910ohkyMreRk",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const planKey = body.planKey as string | undefined;

    if (!planKey || !PRICE_IDS[planKey]) {
      return NextResponse.json(
        { error: "Plan invalide" },
        { status: 400 }
      );
    }

    const priceId = PRICE_IDS[planKey];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${LOCAL_SITE_URL}/salesrooms?checkout=success&plan=${planKey}`,
      cancel_url: `${LOCAL_SITE_URL}/onboarding/plan?checkout=cancel`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur création session Stripe:", error);
    return NextResponse.json(
      { error: "Erreur Stripe" },
      { status: 500 }
    );
  }
}



