// app/api/stripe/webhook/route.ts
// TEMP: Webhook Stripe désactivé pour stabiliser le projet.
// On renvoie simplement 200 pour éviter les erreurs TypeScript.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true });
}


