'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

// 1) Mise à jour manuelle du pitch
export async function updatePitch(formData: FormData) {
  const id = Number(formData.get('id'));
  const Titre = (formData.get('Titre') || '').toString();
  const Texte = (formData.get('Texte') || '').toString();
  const Type = (formData.get('Type') || '').toString();
  const price = Number(formData.get('price') || 0);
  const status = (formData.get('status') || '').toString() || 'Froid';

  if (!id || Number.isNaN(id)) {
    throw new Error('ID invalide');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('pitches')
    .update({ Titre, Texte, Type, price, status })
    .eq('id', id);

  if (error) {
    console.error('Erreur update pitch:', error);
    throw new Error('Erreur lors de la mise à jour');
  }

  redirect(`/room2?id=${id}`);
}

// 2) Génération du texte avec l'IA
export async function generatePitchText(formData: FormData) {
  const id = Number(formData.get('id'));
  const Titre = (formData.get('Titre') || '').toString();
  const Type = (formData.get('Type') || '').toString();
  const price = Number(formData.get('price') || 0);

  if (!id || Number.isNaN(id)) {
    throw new Error('ID invalide');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY manquant dans .env.local');
  }

  const prompt = `
Tu es un expert en vente au téléphone en français (Québec).
Génère un script de pitch structuré pour ce produit/service.

Titre: ${Titre || 'N/A'}
Type d'appel (contexte): ${Type || 'N/A'}
Prix: ${price || 0} $

Structure attendue, en texte simple:
1) Accroche
2) Découverte (questions)
3) Présentation de l'offre
4) Traitement d'une objection fréquente
5) Closing / appel à l'action

Fais des phrases courtes, ton naturel, orienté conversion.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu écris des scripts de vente efficaces en français.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erreur OpenAI:', err);
    throw new Error("Erreur lors de l'appel à l'IA");
  }

  const json = await response.json();
  const generatedText =
    json.choices?.[0]?.message?.content?.toString() ?? '';

  if (!generatedText.trim()) {
    throw new Error('Texte généré vide');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('pitches')
    .update({ Texte: generatedText })
    .eq('id', id);

  if (error) {
    console.error('Erreur update pitch après génération IA:', error);
    throw new Error("Impossible d'enregistrer le texte généré");
  }

  redirect(`/room2?id=${id}`);
}

