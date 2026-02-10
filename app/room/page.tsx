"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Room = {
  id: string;
  name?: string;
  access_token?: string;
  token?: string;
};

export default function RoomClientPage() {
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const res = await fetch("/api/room2-data");
        if (!res.ok) {
          console.error("Erreur chargement room", res.status);
          return;
        }
        const data = await res.json();
        setRoom(data.room);
      } catch (err) {
        console.error("Erreur fetch room", err);
      }
    };

    loadRoom();
  }, []);

  const token = room?.access_token ?? room?.token ?? "";

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">
        Room client pour le pitch #1
      </h1>

      {!room && <p>Chargement de la salle...</p>}

      {room && (
        <div className="space-y-4">
          <div>
            <p>ID de la room : {room.id}</p>
            {room.name && <p>Nom : {room.name}</p>}
          </div>

          <div>
            <Link
              href={`/salesroom-avatar?roomId=${room.id}&token=${token}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
            >
              Ouvrir l’avatar
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}







































































