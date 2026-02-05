// app/encan/[uuid]/actions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function placeBid(formData: FormData) {
  const auction_uuid = formData.get('auction_uuid') as string | null;
  const amountRaw = formData.get('amount') as string | null;

  if (!auction_uuid || !amountRaw) {
    throw new Error('auction_uuid ou amount manquant');
  }

  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error('Montant invalide');
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { error } = await supabase.from('bids').insert({
    auction_uuid,
    amount,
    paddle_number: '101',
  });

  if (error) {
    console.error('Erreur insert bid', error);
    throw error;
  }
}

