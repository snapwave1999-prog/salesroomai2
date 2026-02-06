// app/api/close-expired-auctions/route.ts
import { NextResponse } from 'next/server';
import { adminClient } from '@/utils/supabase/admin';

export async function POST() {
  try {
    const { data: expiredAuctions, error } = await adminClient
      .from('auctions')
      .select('id, ends_at')
      .lte('ends_at', new Date().toISOString())
      .eq('status', 'open');

    if (error) {
      console.error('Error fetching expired auctions', error);
      return NextResponse.json(
        { error: 'Failed to fetch expired auctions' },
        { status: 500 }
      );
    }

    if (!expiredAuctions || expiredAuctions.length === 0) {
      return NextResponse.json({ closedCount: 0 });
    }

    const ids = expiredAuctions.map((a) => a.id);

    const { error: updateError } = await adminClient
      .from('auctions')
      .update({ status: 'closed' })
      .in('id', ids);

    if (updateError) {
      console.error('Error closing expired auctions', updateError);
      return NextResponse.json(
        { error: 'Failed to close expired auctions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ closedCount: ids.length });
  } catch (err) {
    console.error('Unexpected error in close-expired-auctions route', err);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}







