// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

// IMPORTANT : ce secret sera ajouté dans STRIPE_WEBHOOK_SECRET
// après la création du webhook dans le Dashboard Stripe.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    console.error("Signature Stripe ou webhook secret manquant");
    return new NextResponse("Webhook configuration error", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Erreur de vérification Stripe webhook:", err);
    return new NextResponse("Signature error", { status: 400 });
  }

  try {
    // On pourra gérer plusieurs types d'événements ici
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // TODO: plus tard, quand tout sera prêt,
        // on mettra ici la logique pour mettre à jour profiles.plan_key
        // dans Supabase en fonction du plan acheté.

        console.log(
          "Checkout session completed pour le client:",
          session.customer
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // TODO: plus tard, on synchronisera ici l'état de l'abonnement
        // (actif, annulé, etc.) avec ta base Supabase.

        console.log(
          "Subscription event:",
          event.type,
          "status:",
          subscription.status
        );
        break;
      }

      default:
        console.log("Événement Stripe ignoré:", event.type);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Erreur interne dans le webhook Stripe:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}



