// app/salesroom-avatar/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SalesRoomAvatarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const salesroomId = searchParams.get('salesroomId') ?? '1';
  const title = searchParams.get('title') ?? '';
  const subtitle = searchParams.get('subtitle') ?? '';

  const [message, setMessage] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleTalk = async () => {
    try {
      setIsTalking(true);
      setError(null);
      setMessage('');
      setAudioUrl(null);

      // 1) Générer le texte du pitch
      const resText = await fetch('/api/avatar-talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesroomId, title, subtitle }),
      });

      if (!resText.ok) {
        setError("Erreur lors de l'appel de l'avatar (texte).");
        return;
      }

      const dataText = (await resText.json()) as { text?: string };
      const finalText =
        dataText.text ?? "L'avatar n'a rien répondu.";
      setMessage(finalText);

      // 2) Appeler le TTS OpenAI pour transformer le texte en audio
      const resTts = await fetch('/api/avatar-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: finalText }),
      });

      if (!resTts.ok) {
        setError("Texte généré, mais erreur TTS (voix).");
        return;
      }

      const dataTts = (await resTts.json()) as { audioUrl?: string };
      if (!dataTts.audioUrl) {
        setError("Texte généré, mais audio manquant.");
        return;
      }

      setAudioUrl(dataTts.audioUrl);
    } catch {
      setError("Erreur réseau lors de l'appel de l'avatar.");
    } finally {
      setIsTalking(false);
    }
  };

  const goBack = () => {
    router.push('/salesroom');
  };

  return (
    <main className="min-h-screen p-6 bg-slate-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 space-y-4">
        <button
          onClick={goBack}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour à la SalesRoom
        </button>

        <h1 className="text-2xl font-bold text-slate-900">SalesRoom Avatar</h1>

        <p className="text-slate-700">
          Salesroom ID : <span className="font-semibold">{salesroomId}</span>
        </p>

        {title && (
          <p className="text-slate-800">
            Véhicule : <span className="font-semibold">{title}</span>
          </p>
        )}

        {subtitle && (
          <p className="text-sm text-slate-600">{subtitle}</p>
        )}

        <div className="border rounded p-4 space-y-3 mt-4">
          <h2 className="font-semibold text-slate-900">Avatar</h2>
          <p className="text-sm text-slate-600">
            Le bouton génère un pitch IA puis le lit avec une voix OpenAI.
          </p>

          <button
            onClick={handleTalk}
            disabled={isTalking}
            className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
          >
            {isTalking ? "L'avatar parle..." : "Faire parler l'avatar"}
          </button>

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          {message && !error && (
            <p className="text-sm text-slate-800 mt-2">{message}</p>
          )}

          {audioUrl && (
            <audio
              className="mt-3 w-full"
              controls
              autoPlay
              src={audioUrl}
            />
          )}
        </div>
      </div>
    </main>
  );
}


































