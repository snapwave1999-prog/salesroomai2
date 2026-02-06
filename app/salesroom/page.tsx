'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type Salesroom = {
  id: string;
  title: string;
  subtitle: string | null;
};

type AuctionStatus = 'open' | 'closed' | 'scheduled' | string;

type Auction = {
  demo: string;
  salesroom_id: string;
  status: AuctionStatus;
  start_price: number;
  reserve_price: number | null;
  ends_at: string | null;
  created_at?: string;
};

type Bid = {
  id: string;
  auction_id: string;
  amount: number;
  bidder_name: string | null;
  created_at: string;
};

type AuctionOrder = {
  id: string;
  auction_id: string;
  salesroom_id: string;
  winner_name: string | null;
  winner_bid_amount: number;
  status: string;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase env manquantes : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase non initialisé : vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function hasAuctionEnded(auction: Auction | null, now: number): boolean {
  if (!auction) return false;
  if (auction.ends_at) {
    const endsAtTime = new Date(auction.ends_at).getTime();
    if (!Number.isNaN(endsAtTime) && endsAtTime <= now) {
      return true;
    }
  }
  return auction.status !== 'open';
}

function getRemainingTimeLabel(auction: Auction | null, now: number): string {
  if (!auction || !auction.ends_at) return 'Non défini';
  const endsAt = new Date(auction.ends_at).getTime();
  if (Number.isNaN(endsAt) || endsAt <= now) return 'Terminé';

  const diffMs = endsAt - now;
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

// --- Conversion de nombres en texte FR pour TTS ---

const UNITS = [
  'zéro',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
];

const TENS = [
  '',
  'dix',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'soixante',
  'quatre-vingt',
  'quatre-vingt',
];

function numberToFrenchWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return `${n}`;
  if (n === 0) return 'zéro';
  if (n > 999_999) return `${n}`;

  const parts: string[] = [];

  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(`${convertHundreds(thousands)} mille`);
    }
  }

  if (rest > 0) {
    parts.push(convertHundreds(rest));
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function convertHundreds(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];

  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push('cent');
    } else {
      parts.push(`${UNITS[hundreds]} cent${rest === 0 ? 's' : ''}`);
    }
  }

  if (rest > 0) {
    parts.push(convertTens(rest));
  }

  return parts.join(' ');
}

function convertTens(n: number): string {
  if (n < 17) return UNITS[n];
  if (n < 20) return `dix-${UNITS[n - 10]}`;

  const tens = Math.floor(n / 10);
  const unit = n % 10;

  if (tens === 7 || tens === 9) {
    const base = TENS[tens];
    const teen = n === 71 || n === 91 ? 'onze' : UNITS[10 + unit];
    const glue = n === 71 || n === 91 ? ' et ' : '-';
    return `${base}${glue}${teen}`;
  }

  if (tens === 8 && unit === 0) {
    return 'quatre-vingts';
  }

  let result = TENS[tens];

  if (
    unit === 1 &&
    (tens === 1 ||
      tens === 2 ||
      tens === 3 ||
      tens === 4 ||
      tens === 5 ||
      tens === 6)
  ) {
    result += ' et un';
  } else if (unit > 0) {
    result += `-${UNITS[unit]}`;
  }

  return result;
}

// --- TTS helper partagé ---

async function playVoice(text: string) {
  try {
    const res = await fetch('/api/bid-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: 'alloy',
      }),
    });

    if (!res.ok) {
      console.error('Erreur TTS (playVoice):', await res.json());
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
  } catch (error) {
    console.error('Erreur TTS playVoice:', error);
  }
}

// Avatar IA : parle à chaque nouvelle mise
async function handleBidEvent(
  bid: Bid,
  salesroom: Salesroom | null,
  auction: Auction | null
) {
  const montant = bid.amount;
  const montantTexte = numberToFrenchWords(montant);
  const nom = bid.bidder_name?.trim() || 'un enchérisseur anonyme';
  const titre = salesroom?.title?.trim() || 'cette salle de vente';

  const text = `Nouvelle offre de ${montantTexte} dollars sur ${titre}, par ${nom}.`;

  console.log('🎤 Avatar IA - nouvelle mise :', {
    text,
    amount: bid.amount,
    bidder_name: bid.bidder_name,
    salesroom_title: salesroom?.title,
    auction_id: bid.auction_id,
    auction_status: auction?.status,
  });

  await playVoice(text);
}

// Avatar IA : annonce de début d'encan
async function handleAuctionStartEvent(
  salesroom: Salesroom | null,
  auction: Auction | null
) {
  const titre = salesroom?.title?.trim() || 'cette salle de vente';
  const text = `Bienvenue dans l'encan pour ${titre}. Vous pouvez maintenant placer vos offres.`;
  console.log('🎤 Avatar IA - début encan :', { text });
  await playVoice(text);
}

// Avatar IA : annonce de fin d'encan (avec gagnant)
async function handleAuctionEndEvent(
  salesroom: Salesroom | null,
  auction: Auction | null,
  bids: Bid[]
) {
  const titre = salesroom?.title?.trim() || 'cette salle de vente';

  console.log('🎤 Avatar IA - fin encan déclenchée, bids:', bids);

  if (!bids.length) {
    const text = `L'encan est maintenant terminé pour ${titre}. Aucune offre n'a été placée.`;
    console.log('🎤 Avatar IA - fin encan sans offres :', { text });
    await playVoice(text);
    return;
  }

  const bestBid = bids.reduce((max, b) => (b.amount > max.amount ? b : max));

  const montant = bestBid.amount;
  const montantTexte = numberToFrenchWords(montant);
  const nom = bestBid.bidder_name?.trim() || 'un enchérisseur anonyme';

  const text = `L'encan est terminé pour ${titre}. L'offre gagnante est de ${montantTexte} dollars, remportée par ${nom}.`;

  console.log('🎤 Avatar IA - fin encan avec gagnant :', {
    text,
    bestBid,
  });

  await playVoice(text);
}

// Appel à l’API de finalisation d’encan (serveur)
async function finalizeAuctionOrder(
  auction: Auction | null,
  salesroom: Salesroom | null
): Promise<AuctionOrder | null> {
  if (!auction || !salesroom) return null;

  try {
    const res = await fetch('/api/auction-finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auction_id: auction.demo,
        salesroom_id: salesroom.id,
      }),
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    console.log('Réponse finalizeAuctionOrder OK:', json);
    return json.order as AuctionOrder;
  } catch (err) {
    console.error('Erreur réseau finalizeAuctionOrder:', err);
    return null;
  }
}

// Chargement direct de l’ordre gagnant depuis Supabase
async function fetchExistingAuctionOrder(
  supabase: SupabaseClient,
  auction: Auction | null,
  salesroom: Salesroom | null
): Promise<AuctionOrder | null> {
  if (!auction || !salesroom) return null;

  const { data, error } = await supabase
    .from('auction_orders')
    .select(
      'id, auction_id, salesroom_id, winner_name, winner_bid_amount, status, created_at'
    )
    .eq('auction_id', auction.demo)
    .eq('salesroom_id', salesroom.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erreur lecture auction_orders:', error);
    return null;
  }

  if (!data) return null;
  return data as AuctionOrder;
}

// Appel à l’API Stripe Checkout pour un ordre donné (sans console.error)
async function startCheckoutForOrder(order: AuctionOrder): Promise<string | null> {
  try {
    const res = await fetch('/api/auction-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auction_order_id: order.id }),
    });

    if (!res.ok) {
      // On ne log plus dans la console; on laisse handlePayOrder afficher un message UX
      try {
        await res.json();
      } catch {
        // pas de JSON, on ignore
      }
      return null;
    }

    const json = await res.json();
    return json.url as string;
  } catch {
    // pas de console.error ici non plus
    return null;
  }
}

export default function SalesroomPage() {
  const [salesroom, setSalesroom] = useState<Salesroom | null>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [amountInput, setAmountInput] = useState<string>('');
  const [bidderNameInput, setBidderNameInput] = useState<string>('');
  const [userName, setUserName] = useState<string>(''); // pseudo local pour badge
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [salesroomId, setSalesroomId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [hasAnnouncedEnd, setHasAnnouncedEnd] = useState(false);
  const [hasAnnouncedStart, setHasAnnouncedStart] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [order, setOrder] = useState<AuctionOrder | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('salesroomId');
    if (id) {
      setSalesroomId(id);
    } else {
      setError('Aucun salesroomId fourni dans l’URL.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!salesroomId) return;

    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseClient();
    } catch (e) {
      console.error('Erreur d’initialisation Supabase:', e);
      setError(
        'Supabase non configuré (variables NEXT_PUBLIC_SUPABASE_URL / ANON_KEY manquantes).'
      );
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: salesroomData,
          error: salesroomError,
        } = await supabase
          .from('salesrooms')
          .select('id, title, subtitle')
          .eq('id', salesroomId)
          .maybeSingle();

        if (salesroomError) {
          console.error(
            'Salesroom error detail:',
            JSON.stringify(salesroomError, null, 2)
          );
          setError('Erreur lors du chargement de la SalesRoom.');
          setLoading(false);
          return;
        }

        if (!salesroomData) {
          setError('Salle introuvable.');
          setSalesroom(null);
          setAuction(null);
          setBids([]);
          setLoading(false);
          return;
        }

        setSalesroom(salesroomData as Salesroom);

        const {
          data: auctionsData,
          error: auctionsError,
        } = await supabase
          .from('auctions')
          .select(
            'demo, salesroom_id, status, start_price, reserve_price, ends_at, created_at'
          )
          .eq('salesroom_id', salesroomId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (auctionsError) {
          console.error(
            'Auction error detail:',
            JSON.stringify(auctionsError, null, 2)
          );
          setError('Erreur lors du chargement de l’encan.');
          setAuction(null);
          setBids([]);
          setLoading(false);
          return;
        }

        if (!auctionsData || auctionsData.length === 0) {
          setAuction(null);
          setBids([]);
          setLoading(false);
          return;
        }

        const latestAuction = auctionsData[0] as Auction;
        setAuction(latestAuction);
        setHasAnnouncedEnd(false);
        setHasAnnouncedStart(false);
        setOrder(null);
        setCheckoutError(null);

        const {
          data: bidsData,
          error: bidsError,
        } = await supabase
          .from('bids')
          .select('id, auction_id, amount, bidder_name, created_at')
          .eq('auction_id', latestAuction.demo)
          .order('created_at', { ascending: false });

        if (bidsError) {
          console.error(
            'Bids error detail:',
            JSON.stringify(bidsError, null, 2)
          );
          setError('Erreur lors du chargement des mises.');
          setBids([]);
          setLoading(false);
          return;
        }

        setBids((bidsData ?? []) as Bid[]);

        // Si un ordre existe déjà (insert SQL ou finalize), on le charge
        const existingOrder = await fetchExistingAuctionOrder(
          supabase,
          latestAuction,
          salesroomData as Salesroom
        );
        if (existingOrder) {
          setOrder(existingOrder);
        }

        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in loadData:', err);
        setError('Une erreur inattendue est survenue.');
        setLoading(false);
      }
    }

    loadData();
  }, [salesroomId]);

  // Annonce début/fin d'encan (avec gagnant à la fin, finalisation + re-fetch de l’ordre)
  useEffect(() => {
    if (!auction) return;

    const ended = hasAuctionEnded(auction, now);
    const isOpen = !ended;

    // Début : uniquement si audio activé
    if (audioEnabled && isOpen && !hasAnnouncedStart) {
      console.log('🎤 Effect début encan: isOpen && !hasAnnouncedStart', {
        auction,
      });
      setHasAnnouncedStart(true);
      void handleAuctionStartEvent(salesroom, auction);
    }

    // Fin : finalizeOrder toujours, puis relecture de l’ordre dans Supabase
    if (ended && !hasAnnouncedEnd) {
      console.log('🎤 Effect fin encan: ended && !hasAnnouncedEnd', {
        auction,
        bids,
      });
      setHasAnnouncedEnd(true);

      void (async () => {
        const supabase = getSupabaseClient();

        // 1) essayer de finaliser côté API (si la route est configurée)
        const createdOrder = await finalizeAuctionOrder(auction, salesroom);
        if (createdOrder) {
          setOrder(createdOrder);
        } else {
          // 2) si la route ne renvoie rien ou si tu as créé l’ordre à la main en SQL,
          // on va chercher directement le dernier ordre en BDD
          const existing = await fetchExistingAuctionOrder(
            supabase,
            auction,
            salesroom
          );
          if (existing) {
            setOrder(existing);
          }
        }
      })();

      // 3) annonce vocale si audio activé
      if (audioEnabled) {
        void handleAuctionEndEvent(salesroom, auction, bids);
      }
    }

    if (!ended && hasAnnouncedEnd) {
      setHasAnnouncedEnd(false);
    }
    if (!isOpen && hasAnnouncedStart) {
      setHasAnnouncedStart(false);
    }
  }, [
    auction,
    now,
    hasAnnouncedEnd,
    hasAnnouncedStart,
    salesroom,
    audioEnabled,
    bids,
  ]);

  useEffect(() => {
    if (!auction) return;

    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseClient();
    } catch (e) {
      console.error('Erreur d’initialisation Supabase (Realtime):', e);
      return;
    }

    const channel = supabase
      .channel(`bids-auction-${auction.demo}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auction.demo}`,
        },
        async (payload) => {
          const newBid = payload.new as Bid;
          setBids((prev) => {
            const exists = prev.some((b) => b.id === newBid.id);
            if (exists) return prev;
            return [newBid, ...prev];
          });

          await handleBidEvent(newBid, salesroom, auction);
        }
      )
      .subscribe((status) => {
        console.log('Realtime bids status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auction, salesroom]);

  const minRequiredAmount = useMemo(() => {
    if (!auction) return null;
    if (!bids.length) {
      return auction.start_price;
    }
    const highestBidAmount = Math.max(...bids.map((b) => b.amount));
    return highestBidAmount + 1;
  }, [auction, bids]);

  const auctionEnded = hasAuctionEnded(auction, now);
  const auctionIsOpen = !!auction && !auctionEnded;
  const endsAtLabel =
    auction && auction.ends_at
      ? new Date(auction.ends_at).toLocaleString('fr-CA')
      : 'Non définie';
  const remainingLabel = getRemainingTimeLabel(auction, now);

  // Calcul du meilleur enchérisseur / résumé
  const highestBid = useMemo(() => {
    if (!bids.length) return null;
    return bids.reduce((max, b) => (b.amount > max.amount ? b : max), bids[0]);
  }, [bids]);

  const totalBids = bids.length;
  const uniqueBiddersCount = useMemo(() => {
    const set = new Set<string>();
    for (const b of bids) {
      const name = (b.bidder_name || 'Anonyme').trim().toLowerCase();
      set.add(name);
    }
    return set.size;
  }, [bids]);

  const normalizedUserName = userName.trim().toLowerCase();
  const normalizedHighestName = highestBid?.bidder_name
    ?.trim()
    .toLowerCase() || '';

  const userIsLeading =
    normalizedUserName.length > 0 &&
    normalizedHighestName.length > 0 &&
    normalizedUserName === normalizedHighestName;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!auction) {
      setFormError('Aucun encan disponible pour cette SalesRoom.');
      return;
    }

    if (!auctionIsOpen) {
      setFormError(
        `Cet encan n’est pas ouvert aux mises (statut actuel : ${auction.status}).`
      );
      return;
    }

    if (!amountInput) {
      setFormError('Veuillez entrer un montant.');
      return;
    }

    const amountNumber = Number(amountInput);

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setFormError('Le montant de la mise doit être un nombre positif.');
      return;
    }

    if (minRequiredAmount !== null && amountNumber < minRequiredAmount) {
      setFormError(
        `La mise minimale actuelle est de ${formatCurrency(minRequiredAmount)}.`
      );
      return;
    }

    const trimmedName = bidderNameInput.trim();
    if (trimmedName) {
      setUserName(trimmedName);
    }

    let supabase: SupabaseClient;
    try {
      supabase = getSupabaseClient();
    } catch (e) {
      console.error('Erreur d’initialisation Supabase (submit):', e);
      setFormError(
        'Supabase non configuré (variables NEXT_PUBLIC_SUPABASE_URL / ANON_KEY manquantes).'
      );
      return;
    }

    try {
      setSubmitting(true);

      const { data, error } = await supabase
        .from('bids')
        .insert({
          auction_id: auction.demo,
          amount: amountNumber,
          bidder_name: trimmedName || null,
        })
        .select('id, auction_id, amount, bidder_name, created_at')
        .single();

      if (error) {
        console.error(
          'Insert bid error detail:',
          JSON.stringify(error, null, 2)
        );
        setFormError('Erreur lors de l’enregistrement de la mise.');
        setSubmitting(false);
        return;
      }

      const newBid = data as Bid;
      setBids((prev) => {
        const exists = prev.some((b) => b.id === newBid.id);
        if (exists) return prev;
        return [newBid, ...prev];
      });

      setAmountInput('');
      setSubmitting(false);
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err);
      setFormError('Une erreur inattendue est survenue lors de la mise.');
      setSubmitting(false);
    }
  }

  async function handlePayOrder() {
    if (!order) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const url = await startCheckoutForOrder(order);
      if (!url) {
        setCheckoutError(
          "Impossible de démarrer le paiement Stripe pour ce lot."
        );
        setCheckoutLoading(false);
        return;
      }
      window.location.href = url;
    } catch {
      setCheckoutError('Erreur inattendue lors du lancement du paiement.');
      setCheckoutLoading(false);
    }
  }

  const isLoadingOrNoSalesroom = loading && !salesroom && !error;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          SalesRoom &amp; Encan
        </h1>

        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAudioEnabled(true)}
            className={`rounded-md px-3 py-2 text-sm font-medium shadow-sm border ${
              audioEnabled
                ? 'bg-green-600 text-white border-green-700'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {audioEnabled ? 'Voix de l’avatar activée' : 'Activer la voix de l’avatar'}
          </button>
          {!audioEnabled && (
            <span className="text-xs text-gray-500">
              Cliquez ici une fois pour autoriser le son dans votre navigateur.
            </span>
          )}
        </div>

        {isLoadingOrNoSalesroom && (
          <div className="rounded-md bg-white p-4 shadow">
            <p className="text-gray-700">Chargement en cours...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 shadow">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {salesroom && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-gray-400">
                  SalesRoom ID: {salesroom.id}
                </p>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {salesroom.title}
                </h2>
                {salesroom.subtitle && (
                  <p className="text-sm text-gray-600">
                    {salesroom.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de l&apos;encan
                </h3>
                {auction && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                    Statut:&nbsp;
                    <span
                      className={
                        auctionIsOpen
                          ? 'text-green-600'
                          : auction.status === 'closed' || auctionEnded
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }
                    >
                      {auctionEnded ? 'closed' : auction.status}
                    </span>
                  </span>
                )}
              </div>

              {!auction && (
                <p className="mt-2 text-sm text-gray-600">
                  Aucun encan trouvé pour cette SalesRoom.
                </p>
              )}

              {auction && (
                <>
                  <div className="mt-3 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-4">
                    <div className="rounded-md bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Prix de départ</p>
                      <p className="mt-1 font-semibold">
                        {formatCurrency(auction.start_price)}
                      </p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Prix de réserve</p>
                      <p className="mt-1 font-semibold">
                        {auction.reserve_price
                          ? formatCurrency(auction.reserve_price)
                          : 'Aucun'}
                      </p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Prochaine mise minimale
                      </p>
                      <p className="mt-1 font-semibold">
                        {minRequiredAmount !== null
                          ? formatCurrency(minRequiredAmount)
                          : '-'}
                      </p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Fin de l&apos;encan
                      </p>
                      <p className="mt-1 font-semibold">{endsAtLabel}</p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3 sm:col-span-4">
                      <p className="text-xs text-gray-500">Temps restant</p>
                      <p className="mt-1 font-semibold">
                        {auctionEnded ? 'Terminé' : remainingLabel}
                      </p>
                    </div>
                  </div>

                  {/* Résumé encan */}
                  <div className="mt-4 rounded-md bg-indigo-50 p-4 text-sm text-indigo-900">
                    <p className="font-semibold mb-1">
                      Résumé de l&apos;encan
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <span>
                        <span className="font-semibold">
                          {totalBids || 0}
                        </span>{' '}
                        mise{totalBids > 1 ? 's' : ''}
                      </span>
                      <span>
                        <span className="font-semibold">
                          {uniqueBiddersCount || 0}
                        </span>{' '}
                        enchérisseur
                        {uniqueBiddersCount > 1 ? 's' : ''}
                      </span>
                      <span>
                        Meilleure offre actuelle:{' '}
                        <span className="font-semibold">
                          {highestBid
                            ? formatCurrency(highestBid.amount)
                            : '-'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Info ordre (post-encan) + bouton paiement */}
                  {order && (
                    <div className="mt-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-900">
                      <p className="font-semibold mb-1">
                        Dossier gagnant créé
                      </p>
                      <p>
                        Gagnant :{' '}
                        <span className="font-semibold">
                          {order.winner_name || 'Anonyme'}
                        </span>
                      </p>
                      <p>
                        Montant :{' '}
                        <span className="font-semibold">
                          {formatCurrency(order.winner_bid_amount)}
                        </span>
                      </p>
                      <p>
                        Statut :{' '}
                        <span className="font-semibold">{order.status}</span>
                      </p>

                      {order.status === 'pending_payment' && (
                        <div className="mt-3 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={handlePayOrder}
                            disabled={checkoutLoading}
                            className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${
                              checkoutLoading
                                ? 'bg-gray-400 cursor-wait'
                                : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
                            }`}
                          >
                            {checkoutLoading
                              ? 'Redirection vers Stripe...'
                              : 'Payer ce lot (Stripe Checkout)'}
                          </button>
                          {checkoutError && (
                            <p className="text-xs text-red-700">
                              {checkoutError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {auction && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter une mise
              </h3>
              {userName.trim() !== '' && highestBid && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    userIsLeading
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {userIsLeading
                    ? 'Tu es le plus haut enchérisseur.'
                    : 'Tu as été dépassé, augmente ton offre.'}
                </span>
              )}
            </div>

            {auctionEnded && (
              <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                Cet encan est terminé. Aucune nouvelle mise n&apos;est acceptée.
              </div>
            )}

            {!auctionEnded && !auctionIsOpen && (
              <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                Cet encan n&apos;est pas ouvert aux mises (statut actuel :{' '}
                <span className="font-semibold">{auction.status}</span>).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Montant de la mise
                </label>
                <input
                  id="amount"
                  type="number"
                  min={minRequiredAmount ?? undefined}
                  step="1"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 placeholder-opacity-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="1"
                  disabled={!auctionIsOpen || submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="bidder_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ton nom d&apos;enchérisseur
                </label>
                <input
                  id="bidder_name"
                  type="text"
                  value={bidderNameInput}
                  onChange={(e) => {
                    setBidderNameInput(e.target.value);
                    if (e.target.value.trim()) {
                      setUserName(e.target.value.trim());
                    }
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 placeholder-opacity-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ex. Jean, Bidder123..."
                  disabled={!auctionIsOpen || submitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ce nom sert aussi à déterminer si tu es actuellement en tête.
                </p>
              </div>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}

              <button
                type="submit"
                disabled={!auctionIsOpen || submitting}
                className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${
                  !auctionIsOpen || submitting
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                }`}
              >
                {submitting ? 'Enregistrement...' : 'Enchérir'}
              </button>
            </form>
          </div>
        )}

        {auction && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Dernières mises
            </h3>
            {bids.length === 0 ? (
              <p className="text-sm text-gray-600">
                Aucune mise pour le moment.
              </p>
            ) : (
              <ul className="space-y-3">
                {bids.map((bid) => (
                  <li
                    key={bid.id}
                    className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(bid.amount)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {bid.bidder_name || 'Anonyme'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(bid.created_at).toLocaleString('fr-CA')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


























































