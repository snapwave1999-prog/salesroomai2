"use client";

import { useEffect, useState } from "react";
import SalesroomAvatar from "../../components/SalesroomAvatar";

type Room = {
  id: string;
  name?: string;
  access_token?: string;
  token?: string;
};

export default function Room2Page() {
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

  if (!room) {
    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-4">
          Room client pour le pitch #1
        </h1>
        <p>Chargement de la salle...</p>
      </main>
    );
  }

  const token = room.access_token ?? room.token ?? "";

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">
        Room client pour le pitch #1
      </h1>

      <div className="mb-4">
        <p>ID de la room : {room.id}</p>
        {room.name && <p>Nom : {room.name}</p>}
      </div>

      <SalesroomAvatar roomId={room.id} token={token} />
    </main>
  );
}











































