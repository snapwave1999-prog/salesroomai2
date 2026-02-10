"use client";

import { useSearchParams } from "next/navigation";

export default function SalesroomAvatarInner() {
  const searchParams = useSearchParams();

  const roomId = searchParams.get("roomId");
  const token = searchParams.get("token");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>
        <h1>Salesroom Avatar</h1>
        <p>roomId: {roomId ?? "none"}</p>
        <p>token: {token ?? "none"}</p>
        {/* ici tu colles ensuite ton ancien UI/avatar */}
      </div>
    </main>
  );
}

