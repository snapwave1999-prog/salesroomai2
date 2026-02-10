// app/room2/room-client.tsx
"use client";

import { useRouter } from "next/navigation";

type RoomClientProps = {
  pitchId: number;
  salesroomId: string;
};

export function RoomClient({ pitchId, salesroomId }: RoomClientProps) {
  const router = useRouter();

  const handleOpenAvatarRoom = () => {
    router.push(`/salesroom-avatar?salesroomId=${salesroomId}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">
          Room client pour le pitch #{pitchId}
        </h1>

        <p className="text-sm text-slate-300">
          Ici tu pourras afficher le contenu de la room (chat, enchères, etc.)
          pour ce pitch.
        </p>

        <button
          type="button"
          onClick={handleOpenAvatarRoom}
          className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-indigo-50 bg-indigo-600 hover:bg-indigo-500"
        >
          Ouvrir la SalesRoom Avatar
        </button>
      </div>
    </main>
  );
}



































