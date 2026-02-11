// app/room2/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SalesroomAvatar from "../../components/SalesroomAvatar";

function Room2Inner() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const token = searchParams.get("token");

  if (!roomId || !token) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Room 2</h1>
          <p>Paramètres manquants (roomId ou token).</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <SalesroomAvatar roomId={roomId} token={token} />
    </main>
  );
}

export default function Room2Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-slate-200">Chargement de la salle...</p>
        </main>
      }
    >
      <Room2Inner />
    </Suspense>
  );
}














































