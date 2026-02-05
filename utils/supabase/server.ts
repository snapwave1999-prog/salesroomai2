// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr';

export function createClient() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {
          // on ignore pour l'instant
        },
        remove() {
          // on ignore pour l'instant
        },
      },
    }
  );

  return supabase;
}


















