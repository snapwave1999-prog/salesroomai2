"use client";

import { useState } from "react";

export default function RoomOperateurPage() {
  const [script, setScript] = useState(
    "Bonjour, ici l’avatar de votre salle de vente.\n\n" +
      "Je vais vous présenter l’offre, répondre à vos questions\n" +
      "et vous guider vers la meilleure décision pour vous."
  );

  const [copied, setCopied] = useState(false);
  const [aiScript, setAiScript] = useState(""); // script amélioré par l’IA
  const [loadingIa, setLoadingIa] = useState(false);

  const [auctionUuid, setAuctionUuid] = useState(""); // ID d’encan
  const [savingAuction, setSavingAuction] = useState(false);

  const [salesroomId, setSalesroomId] = useState(""); // ID de SalesRoom

  const handleCopy = () => {
    navigator.clipboard
      .writeText(script)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        alert("Impossible de copier le texte.");
      });
  };

  const handleSendToBackend = async () => {
    try {
      setLoadingIa(true);
      const res = await fetch("/api/room-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      const data = await res.json();

      if (data.improved) {
        setAiScript(data.improved);
        alert("Script reçu et amélioré par l’IA.");
      } else {
        alert(data.message || "Script envoyé au backend.");
      }
    } catch (e) {
      alert("Erreur lors de l'envoi au backend.");
    } finally {
      setLoadingIa(false);
    }
  };

  const handleSaveToAuction = async () => {
    const textToSave = aiScript || script;

    if (!auctionUuid) {
      alert("ID d'encan manquant.");
      return;
    }

    if (!textToSave) {
      alert("Aucun script à enregistrer.");
      return;
    }

    try {
      setSavingAuction(true);
      const res = await fetch("/api/auction-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionUuid,
          script: textToSave,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        alert(
          data.message ||
            "Erreur lors de l'enregistrement du script dans l'encan."
        );
        return;
      }

      alert("Script enregistré dans cet encan.");
    } catch (e) {
      alert("Erreur réseau lors de l'enregistrement dans l'encan.");
    } finally {
      setSavingAuction(false);
    }
  };

  const handleOpenSalesroom = () => {
    if (!salesroomId) {
      alert("ID de SalesRoom manquant.");
      return;
    }
    window.open(`/salesroom-avatar?id=${salesroomId}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
        {/* Colonne gauche : résumé de l’offre */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h1 className="text-2xl font-semibold">
            Room opérateur – vue interne
          </h1>
          <p className="text-sm text-slate-300">
            Cette page est pour toi, opérateur ou conseiller. Elle te sert de
            pense-bête pendant la vente en direct (avatar ou toi-même).
          </p>

          <div className="space-y-2 text-sm">
            <div>
              <p className="text-slate-400">Service</p>
              <p className="font-medium">
                SalesRoomAI – Salle de vente en ligne avec avatar &amp; encan
              </p>
            </div>

            <div>
              <p className="text-slate-400">Promesse</p>
              <p>
                Une salle de vente en ligne qui parle à tes clients à ta place,
                avec avatar en direct et possibilité d’encan en temps réel.
              </p>
            </div>

            <div>
              <p className="text-slate-400">Pour qui ?</p>
              <p>
                Entrepreneurs, travailleurs autonomes, commerces locaux,
                encanteurs et toute personne qui veut vendre sans passer sa
                journée à « pousser ».
              </p>
            </div>

            <div>
              <p className="text-slate-400">Objectif de l’appel</p>
              <p>
                Vérifier rapidement si une salle de vente avec avatar et encan
                peut s’appliquer à la réalité du client, et proposer une démo
                ou un premier test si c’est le cas.
              </p>
            </div>

            {/* Champ ID d’encan */}
            <div className="pt-4 space-y-1">
              <p className="text-slate-400 text-xs">
                ID d’encan (uuid de la table auctions)
              </p>
              <input
                type="text"
                className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Colle ici l’uuid de l’encan"
                value={auctionUuid}
                onChange={(e) => setAuctionUuid(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                Tu peux copier l’uuid depuis Supabase &gt; auctions, puis le
                coller ici pour lier ce script à un encan précis.
              </p>
            </div>

            {/* Champ ID de SalesRoom */}
            <div className="pt-4 space-y-1">
              <p className="text-slate-400 text-xs">
                ID de SalesRoom (uuid de la table salesrooms)
              </p>
              <input
                type="text"
                className="w-full rounded-md bg-slate-950 border border-slate-800 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Colle ici l’id de la SalesRoom"
                value={salesroomId}
                onChange={(e) => setSalesroomId(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                Copie l’id depuis Supabase &gt; salesrooms pour ouvrir la salle
                publique pour test.
              </p>
            </div>
          </div>
        </section>

        {/* Colonne droite : script / notes opérateur */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Script / notes pour l’avatar
            </h2>
            {copied && (
              <span className="text-xs text-emerald-400">
                Script copié dans le presse‑papiers
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Tu peux adapter ce texte à chaque client. Le bouton « Copier le
            script » est pratique pour coller le message dans un autre outil
            (IA, téléprompteur, etc.).
          </p>

          {/* Script original (éditable) */}
          <textarea
            className="flex-1 min-h-[220px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 resize-vertical focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />

          {/* Script amélioré par l’IA (lecture seule) */}
          {aiScript && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                Version proposée par l’IA (à ajuster au besoin) :
              </p>
              <textarea
                className="min-h-[180px] w-full bg-slate-950 border border-sky-700 rounded-xl p-3 text-sm text-slate-100 resize-vertical focus:outline-none"
                value={aiScript}
                readOnly
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
            >
              Copier le script
            </button>

            <button
              type="button"
              onClick={handleSendToBackend}
              disabled={loadingIa}
              className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loadingIa ? "Envoi..." : "Envoyer au backend (IA + SMS)"}
            </button>

            <button
              type="button"
              onClick={handleSaveToAuction}
              disabled={savingAuction}
              className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {savingAuction ? "Enregistrement..." : "Enregistrer dans l’encan"}
            </button>

            <button
              type="button"
              onClick={handleOpenSalesroom}
              className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-blue-400 transition"
            >
              Ouvrir la SalesRoom publique
            </button>

            <div className="text-xs text-slate-400">
              Astuce : garde tes meilleures phrases ici, tu pourras les
              réutiliser d’une salle de vente à l’autre.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}






