"use client";

import { useState } from "react";

type SalesroomAvatarProps = {
  roomId: string;
  token: string;
};

export default function SalesroomAvatar({ roomId, token }: SalesroomAvatarProps) {
  const [text, setText] = useState("Bonjour, je suis votre avatar SalesRoom.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSpeak = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/avatar-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          roomId,
          token,
        }),
      });

      if (!res.ok) {
        setError("Erreur lors de l'appel TTS.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (e) {
      console.error(e);
      setError("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Avatar pour la room {roomId}</h2>
      <p className="text-sm text-gray-500">Token: {token.slice(0, 8)}...</p>

      <textarea
        className="w-full max-w-xl border rounded p-2"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSpeak}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Génération en cours..." : "Faire parler l’avatar"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

