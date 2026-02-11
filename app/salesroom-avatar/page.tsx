// app/salesroom-avatar/page.tsx
"use client";

export default function SalesroomAvatarPage() {
  const product = {
    title: "Camaro SS 1969",
    price: "49 900 $",
    description:
      "Camaro SS 1969, V8, restauration récente, prêt à rouler. Idéale pour un passionné qui cherche un muscle car emblématique.",
    imageUrl:
      "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            SalesRoomAI – Avatar (client virtuel)
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Entraîne-toi à présenter ton offre à un client virtuel qui réagit
            comme un vrai humain.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[1.4fr,1fr]">
          {/* Colonne gauche : avatar + conversation */}
          <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/80 flex items-center justify-center text-sm font-bold">
                CV
              </div>
              <div>
                <div className="text-sm font-semibold">
                  Client virtuel – Camaro
                </div>
                <div className="text-xs text-slate-400">
                  Pose des questions, fait des objections, réagit à ton pitch.
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 text-sm">
              <div className="flex gap-2">
                <div className="mt-1 h-8 w-8 rounded-full bg-slate-700" />
                <div className="rounded-2xl bg-slate-800 px-3 py-2">
                  <div className="text-xs text-slate-400">
                    Client virtuel
                  </div>
                  <p>
                    Bonjour, ici ton client virtuel. Présente-moi ta Camaro
                    1969 comme si tu me parlais au téléphone.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <div className="rounded-2xl bg-emerald-600 px-3 py-2 text-right">
                  <div className="text-xs text-emerald-100">
                    Toi (vendeur)
                  </div>
                  <p>
                    Bonjour! J&apos;ai une superbe Camaro SS 1969, V8, prête
                    à rouler. C&apos;est une vraie voiture de passionné,
                    parfaitement restaurée.
                  </p>
                </div>
                <div className="mt-1 h-8 w-8 rounded-full bg-emerald-500" />
              </div>

              <div className="flex gap-2">
                <div className="mt-1 h-8 w-8 rounded-full bg-slate-700" />
                <div className="rounded-2xl bg-slate-800 px-3 py-2">
                  <div className="text-xs text-slate-400">
                    Client virtuel
                  </div>
                  <p>
                    OK, intéressant. Mais à ce prix-là, qu&apos;est-ce qui
                    la rend différente des autres Camaro sur le marché?
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <div className="rounded-2xl bg-emerald-600 px-3 py-2 text-right">
                  <div className="text-xs text-emerald-100">
                    Toi (vendeur)
                  </div>
                  <p>
                    C&apos;est une vraie SS avec matching numbers, moteur et
                    boîte conformes, restauration documentée. Elle a été
                    pensée pour rouler, pas juste rester dans un garage.
                  </p>
                </div>
                <div className="mt-1 h-8 w-8 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="mt-2">
              <textarea
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                rows={3}
                placeholder="Écris ici ta prochaine réplique au client virtuel..."
              />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>
                  Astuce : parle comme au téléphone, pas comme dans un courriel.
                </span>
                <button className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-50 hover:bg-emerald-500">
                  Envoyer au client virtuel (bientôt)
                </button>
              </div>
            </div>
          </section>

          {/* Colonne droite : fiche produit / objectifs */}
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-56 w-full object-cover"
              />
              <div className="border-t border-slate-800 p-4">
                <h2 className="text-lg font-semibold">{product.title}</h2>
                <p className="mt-1 text-emerald-400 font-bold">
                  {product.price}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
              <h3 className="text-sm font-semibold">
                Objectifs de cette session
              </h3>
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-300">
                <li>Faire un pitch clair en moins de 60 secondes.</li>
                <li>Répondre à au moins 3 objections sans te perdre.</li>
                <li>Conduire le client vers un rendez-vous ou un dépôt.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}






