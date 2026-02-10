// app/api/signup-ip/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const ipRaw =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "";
    const ip = ipRaw.split(",")[0] || null;

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !ip) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    await supabase
      .from("profiles")
      .update({ signup_ip: ip })
      .eq("id", user.id);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}


