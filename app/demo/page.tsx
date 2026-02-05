// app/demo/page.tsx
export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Petite barre de navigation simple */}
        <nav className="flex items-center justify-between text-xs mb-2">
          <div className="font-semibold text-emerald-400">SRSalesRoomAI – Démo</div>
          <div className="flex items-center gap-4">
            <a
              href="/demo"
              className="text-slate-300 hover:text-emerald-400 transition"
            >
              Accueil démo
            </a>
            <a
              href="/login"
              className="text-slate-300 hover:text-emerald-400 transition"
            >
              Se connecter
            </a>
            <a
              href="/salesroom"
              className="px-3 py-1 rounded-md border border-slate-600 text-slate-100 hover:border-emerald-400 transition"
            >
              Mon tableau de bord
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-wide text-emerald-400 uppercase">
              Démo publique
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              Une SalesRoom virtuelle qui présente ton offre 24/7
            </h1>
            <p className="text-sm md:text-base text-slate-300">
              Montre à tes clients comment ton produit se vend avec un avatar intelligent
              qui pose des questions, répond aux objections et amène vers l&apos;action.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/salesroom-avatar"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 transition"
              >
                Essayer la SalesRoom maintenant
              </a>
              <a
                href="/salesroom"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-slate-600 text-sm text-slate-100 hover:border-emerald-400 transition"
              >
                Gérer mes SalesRooms
              </a>
            </div>

            <ul className="mt-4 space-y-1 text-xs text-slate-400">
              <li>• Pas de compte client requis pour cette démo.</li>
              <li>• Tu peux tester ton pitch comme si tu parlais à un vrai prospect.</li>
            </ul>
          </div>

          {/* Visuel produit simple */}
          <div className="relative">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 border border-slate-700 p-4 shadow-lg">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 mb-4">
                <img
                  src="https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&w=1000"
                  alt="Camaro SS 1969"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Camaro SS 1969</h2>
                  <p className="text-sm text-slate-300">
                    Exemple de produit présenté dans une SalesRoom virtuelle.
                  </p>
                </div>
                <p className="text-lg font-semibold text-emerald-400">49 900 $</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">1. Tu configures ton offre</h3>
            <p className="text-xs text-slate-300">
              Titre, prix, bénéfices principaux : ta SalesRoom est prête en quelques minutes.
            </p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">2. L&apos;avatar mène la discussion</h3>
            <p className="text-xs text-slate-300">
              Il pose des questions, écoute les objections et adapte son discours comme un vrai vendeur.
            </p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">3. Tu analyses et t&apos;améliores</h3>
            <p className="text-xs text-slate-300">
              Tu rejoues les scènes, lis le feedback du coach et améliores ton script de vente.
            </p>
          </div>
        </section>

        {/* Call to action final */}
        <section className="rounded-2xl border border-emerald-600/40 bg-emerald-500/10 px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Prêt à tester ta première SalesRoom ?
            </h2>
            <p className="text-xs text-slate-200 mt-1">
              Utilise la démo pour t&apos;entraîner, puis crée tes propres rooms dans l&apos;espace privé.
            </p>
          </div>
          <a
            href="/salesroom-avatar"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 transition"
          >
            Lancer la démo
          </a>
        </section>
      </div>
    </main>
  );
}
