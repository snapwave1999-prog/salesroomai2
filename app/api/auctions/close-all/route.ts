import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase
    .from('auctions')
    .update({ status: 'closed' })
    .eq('status', 'open');

  if (error) {
    console.error('Error closing auctions', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
