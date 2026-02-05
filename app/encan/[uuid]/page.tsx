// app/encan/[uuid]/page.tsx
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { EncanRoomClient } from './EncanRoomClient';

type Auction = {
  uuid: string;
  title: string;
  status: string;
  created_at: string;
  start_price: number;
  ends_at: string | null;
  duration_seconds: number | null;
  salesroom_id: string | null;
};

type Bid = {
  id: string;
  created_at: string;
  amount: number;
  paddle_number: string | null;
};

type Salesroom = {
  id: string;
  name: string; // adapte si ta colonne s'appelle différemment (title, label, etc.)
};

export default async function EncanPage(props: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await props.params;

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

  // Charger l'encan
  const { data: auction, error: auctionError } = await supabase
    .from('auctions')
    .select('*')
    .eq('uuid', uuid)
    .single<Auction>();

  if (auctionError || !auction) {
    console.error(auctionError);
    notFound();
  }

  // Charger la SalesRoom liée (si présente)
  let salesroom: Salesroom | null = null;

  if (auction.salesroom_id) {
    const { data: salesroomData, error: salesroomError } = await supabase
      .from('salesrooms')
      .select('id, name')
      .eq('id', auction.salesroom_id)
      .single<Salesroom>();

    if (salesroomError) {
      console.error('Erreur chargement salesroom', salesroomError);
    } else {
      salesroom = salesroomData ?? null;
    }
  }

  // Charger les mises
  const { data: bids, error: bidsError } = await supabase
    .from('bids')
    .select('*')
    .eq('auction_uuid', uuid)
    .order('created_at', { ascending: false });

  if (bidsError) {
    console.error(bidsError);
  }

  return (
    <main
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: 16,
      }}
    >
      <EncanRoomClient
        auction={auction}
        bids={(bids ?? []) as Bid[]}
        salesroomName={salesroom?.name ?? null}
      />
    </main>
  );
}























