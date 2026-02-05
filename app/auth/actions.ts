// app/auth/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signUp(formData: FormData) {
  const email = (formData.get("email") || "").toString();
  const password = (formData.get("password") || "").toString();

  if (!email || !password) {
    redirect("/auth/sign-up?error=Email%20et%20mot%20de%20passe%20requis");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Erreur signup:", error);
    const msg = encodeURIComponent(error.message || "Erreur lors de l'inscription");
    redirect(`/auth/sign-up?error=${msg}`);
  }

  redirect("/auth/sign-in?info=Compte%20créé%2C%20vous%20pouvez%20vous%20connecter");
}

export async function signIn(formData: FormData) {
  const email = (formData.get("email") || "").toString();
  const password = (formData.get("password") || "").toString();

  if (!email || !password) {
    redirect("/auth/sign-in?error=Email%20et%20mot%20de%20passe%20requis");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erreur sign-in:", error);
    const msg = encodeURIComponent(
      error.message || "Email ou mot de passe invalide"
    );
    redirect(`/auth/sign-in?error=${msg}`);
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Erreur sign-out:", error);
    const msg = encodeURIComponent(error.message || "Erreur lors de la déconnexion");
    redirect(`/auth/sign-in?error=${msg}`);
  }

  redirect("/auth/sign-in");
}


