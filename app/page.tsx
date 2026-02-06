'use client';

import { useState } from 'react';

export default function HomePage() {
  const [loadingVoice, setLoadingVoice] = useState(false);

  async function handleTestVoice() {
    try {
      setLoadingVoice(true);

      const res = await fetch('/api/bid-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Nouvelle mise de 250 dollars par Jean.',
          voice: 'alloy',
        }),
      });

      if (!res.ok) {
        console.error('Erreur TTS:', await res.json());
        setLoadingVoice(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();

      setLoadingVoice(false);
    } catch (error) {
      console.error('Erreur handleTestVoice:', error);
      setLoadingVoice(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <button
        onClick={handleTestVoice}
        disabled={loadingVoice}
        className={`rounded px-6 py-3 text-sm font-semibold text-white shadow ${
          loadingVoice
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {loadingVoice ? 'Génération de la voix…' : 'Tester la voix TTS'}
      </button>
    </main>
  );
}































