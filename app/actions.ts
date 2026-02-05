"use server";

import { redirect } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export async function createPitch(formData: FormData) {
  const Titre = formData.get("Titre") as string;
  const Texte = formData.get("Texte") as string;
  const Type = formData.get("Type") as string;
  const price = Number(formData.get("price") ?? 0);
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("pitches2")
    .insert([
      {
        Titre,
        Texte,
        Type,
        price,
        status,
      },
    ]);

  if (error) {
    console.error("Erreur création pitch - error:", error);
    throw new Error("Impossible de créer le pitch");
  }

  redirect("/");
}







