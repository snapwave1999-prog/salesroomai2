// app/api/close-auction/route.ts
import { NextResponse } from 'next/server';
import { adminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const { auctionId } = await request.json();

    if (!auctionId) {
      return NextResponse.json(
        { error: 'auctionId is required' },
        { status: 400 }
      );
    }

    const { error } = await adminClient
      .from('auctions')
      .update({ status: 'closed' })
      .eq('id', auctionId);

    if (error) {
      console.error('Error closing auction', error);
      return NextResponse.json(
        { error: 'Failed to close auction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unexpected error in close-auction route', err);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}










