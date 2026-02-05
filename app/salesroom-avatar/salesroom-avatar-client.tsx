// app/salesroom-avatar/salesroom-avatar-client.tsx
'use client';

import { useState, useRef } from 'react';

type Props = { salesroomId: string };

export function SalesroomAvatarClient({ salesroomId }: Props) {
  const [pitch, setPitch] = useState<string | null>(null);
  const [loadingPitch, setLoadingPitch] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleGeneratePitch() {
    setLoadingPitch(true);
    setErrorMsg(null);
    setPitch(null);

    try {
      const res = await fetch('/api/salesroom-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: salesroomId }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.message || 'Erreur lors de la génération.');
      }

      setPitch(data.pitch as string);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur inconnue.');
    } finally {
      setLoadingPitch(false);
    }
  }

  async function handlePlayAudio() {
    setLoadingAudio(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/salesroom-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: salesroomId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erreur audio.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur audio inconnue.');
    } finally {
      setLoadingAudio(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGeneratePitch}
          disabled={loadingPitch}
          className="px-3 py-1.5 rounded-md bg-emerald-500 text-slate-950 text-sm font-semibold disabled:opacity-60"
        >
          {loadingPitch ? 'Génération du pitch...' : 'Générer le pitch IA'}
        </button>

        <button
          onClick={handlePlayAudio}
          disabled={loadingAudio}
          className="px-3 py-1.5 rounded-md bg-sky-500 text-slate-950 text-sm font-semibold disabled:opacity-60"
        >
          {loadingAudio ? 'Génération audio...' : 'Écouter le pitch'}
        </button>

        <audio ref={audioRef} controls className="w-full max-w-md" />
      </div>

      {errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}

      {pitch && (
        <div className="mt-2 rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 whitespace-pre-line">
          {pitch}
        </div>
      )}
    </div>
  );
}







