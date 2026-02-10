// app/salesrooms/page.tsx
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";

type PlanKey = "free" | "pro" | "premium" | null;

async function getData() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // TEMPORAIRE : on ne redirige plus vers /auth/login pour éviter la boucle
  if (authError || !user) {
    console.warn("Aucun user détecté dans salesrooms (mode debug).");
    return {
      userId: null,
      planKey: null,
      rooms: [],
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan_key")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Erreur chargement profil:", profileError);
  }

  const { data: rooms, error: roomsError } = await supabase
    .from("salesrooms")
    .select("id, name, affiliate_url, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (roomsError) {
    console.error("Erreur chargement salesrooms:", roomsError);
  }

  return {
    userId: user.id,
    planKey: (profile?.plan_key as PlanKey) ?? null,
    rooms: rooms ?? [],
  };
}

// Action serveur pour créer une salle à partir d'un lien d’affiliation
async function createRoomFromAffiliateLink(formData: FormData) {
  "use server";

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TEMP : si pas de user, on ne redirige pas, on arrête juste l'action
  if (!user) {
    console.warn(
      "Tentative de création de salle affiliée sans user (mode debug)."
    );
    return;
  }

  const affiliateUrl = (formData.get("affiliate_url") as string | null)?.trim();

  if (!affiliateUrl) {
    throw new Error("Lien d’affiliation manquant.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_key")
    .eq("id", user.id)
    .single();

  const planKey = (profile?.plan_key as PlanKey) ?? "free";

  // Règles selon le plan
  if (planKey === "free") {
    throw new Error(
      "La création de salle via lien d’affiliation est réservée aux forfaits Pro et Premium."
    );
  }

  const { count, error: countError } = await supabase
    .from("salesrooms")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if (countError) {
    console.error("Erreur comptage salesrooms:", countError);
    throw new Error("Erreur interne lors du comptage des salles.");
  }

  if (planKey === "pro" && (count ?? 0) >= 10) {
    throw new Error(
      "Limite atteinte : votre forfait Pro permet un maximum de 10 salles."
    );
  }

  const { error: insertError } = await supabase.from("salesrooms").insert({
    owner_id: user.id,
    name: "Salle affiliée",
    affiliate_url: affiliateUrl,
  });

  if (insertError) {
    console.error("Erreur création salle affiliée:", insertError);
    throw new Error("Erreur lors de la création de la salle.");
  }

  revalidatePath("/salesrooms");
}

export default async function SalesroomsPage() {
  const { planKey, rooms } = await getData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mes SalesRooms</h1>

      {/* Info sur le plan */}
      <div className="text-sm text-gray-600">
        Plan actuel : <strong>{planKey ?? "free"}</strong>
      </div>

      {/* Formulaire : créer une salle via lien d’affiliation */}
      <form action={createRoomFromAffiliateLink} className="space-y-3">
        <label className="block text-sm font-medium">
          Lien d’affiliation
          <input
            type="url"
            name="affiliate_url"
            placeholder="https://..."
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
            required
          />
        </label>

        {planKey === "free" ? (
          <p className="text-xs text-red-600">
            La création via lien d’affiliation est réservée aux forfaits Pro et
            Premium.
          </p>
        ) : planKey === "pro" ? (
          <p className="text-xs text-gray-600">
            Forfait Pro : maximum 10 salles au total (manuelles + affiliées).
          </p>
        ) : (
          <p className="text-xs text-gray-600">
            Forfait Premium : salles illimitées.
          </p>
        )}

        <button
          type="submit"
          className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:bg-gray-400"
          disabled={planKey === "free"}
        >
          Créer une salle à partir du lien
        </button>
      </form>

      {/* Liste des salles existantes */}
      <div className="space-y-2">
        {rooms.length === 0 ? (
          <p className="text-sm text-gray-500">
            Vous n’avez pas encore de SalesRoom.
          </p>
        ) : (
          rooms.map((room: any) => (
            <div
              key={room.id}
              className="border rounded px-3 py-2 flex flex-col gap-1"
            >
              <div className="font-medium text-sm">{room.name}</div>
              {room.affiliate_url && (
                <div className="text-xs text-gray-600 break-all">
                  Lien affilié : {room.affiliate_url}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div>
        <Link
          href="/salesrooms/new"
          className="text-sm text-blue-600 underline"
        >
          Créer une salle manuellement
        </Link>
      </div>
    </div>
  );
}










