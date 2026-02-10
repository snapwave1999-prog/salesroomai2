// app/admin/manual-orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type ManualOrder = {
  id: string;
  created_at: string;
  pitch_id: number;
  salesroom_id: string | null;
  amount: number;
  currency: string;
  notes: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ManualOrdersPage() {
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("manual_orders")
          .select("id, created_at, pitch_id, salesroom_id, amount, currency, notes")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erreur chargement manual_orders:", error);
          setError("Impossible de charger les ventes manuelles.");
          setLoading(false);
          return;
        }

        setOrders((data ?? []) as ManualOrder[]);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Erreur inattendue lors du chargement.");
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">
          Ventes manuelles (tests Stripe)
        </h1>

        {loading && <p>Chargement...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !error && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm border border-slate-800">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="px-3 py-2 border-b border-slate-800 text-left">Date</th>
                  <th className="px-3 py-2 border-b border-slate-800 text-left">Pitch</th>
                  <th className="px-3 py-2 border-b border-slate-800 text-left">SalesRoom</th>
                  <th className="px-3 py-2 border-b border-slate-800 text-right">Montant</th>
                  <th className="px-3 py-2 border-b border-slate-800 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-3 border-b border-slate-800 text-center text-slate-400"
                      colSpan={5}
                    >
                      Aucune vente manuelle enregistrée pour le moment.
                    </td>
                  </tr>
                )}

                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/60">
                    <td className="px-3 py-2 border-b border-slate-800">
                      {new Date(o.created_at).toLocaleString("fr-CA")}
                    </td>
                    <td className="px-3 py-2 border-b border-slate-800">
                      #{o.pitch_id}
                    </td>
                    <td className="px-3 py-2 border-b border-slate-800">
                      {o.salesroom_id?.slice(0, 8) ?? "-"}
                    </td>
                    <td className="px-3 py-2 border-b border-slate-800 text-right">
                      {(o.amount / 100).toLocaleString("fr-CA")} {o.currency.toUpperCase()}
                    </td>
                    <td className="px-3 py-2 border-b border-slate-800">
                      {o.notes ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
