// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// Supabase service client (côté serveur)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe-Signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Erreur vérification webhook Stripe:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message ?? "invalid signature"}` },
      { status: 400 }
    );
  }

  // On gère uniquement checkout.session.completed pour l’instant
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const pitchId = session.metadata?.pitchId
      ? Number(session.metadata.pitchId)
      : undefined;
    const salesroomId = session.metadata?.salesroomId ?? null;

    const amount = session.amount_total ?? 0;
    const currency = session.currency ?? "cad";
    const stripeSessionId = session.id;
    const paymentStatus = session.payment_status;
    const customerEmail =
      (session.customer_details && session.customer_details.email) || null;

    if (!pitchId) {
      console.warn(
        "Webhook checkout.session.completed sans pitchId dans metadata"
      );
    } else {
      const { error: insertError } = await supabase.from("orders").insert({
        pitch_id: pitchId,
        salesroom_id: salesroomId,
        amount,
        currency,
        stripe_session_id: stripeSessionId,
        stripe_payment_status: paymentStatus,
        status: paymentStatus === "paid" ? "paid" : "pending",
        customer_email: customerEmail,
        metadata: session.metadata ?? {},
      });

      if (insertError) {
        console.error("Erreur insertion order Supabase:", insertError);
        return NextResponse.json(
          { error: "Erreur enregistrement commande." },
          { status: 500 }
        );
      }
    }
  } else {
    // Pour les autres events, on se contente de les ignorer pour le moment
    console.log(`Stripe webhook event ignoré: ${event.type}`);
  }

  // Stripe attend toujours un 2xx pour considérer le webhook reçu
  return NextResponse.json({ received: true }, { status: 200 });
}
