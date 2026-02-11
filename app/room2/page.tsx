"use client";

import { useSearchParams } from "next/navigation";
import SalesroomAvatar from "../../components/SalesroomAvatar";

export default function Room2Page() {
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













































