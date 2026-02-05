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
};

type Bid = {
  id: string;
  auction_id: string;
  amount: number;
  bidder_name: string | null;
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

// Hook central pour l’avatar IA : sera branché sur ton TTS / voix plus tard
function handleBidEvent(
  bid: Bid,
  salesroom: Salesroom | null,
  auction: Auction | null
) {
  console.log('🎤 Avatar IA - nouvelle mise :', {
    amount: bid.amount,
    bidder_name: bid.bidder_name,
    salesroom_title: salesroom?.title,
    auction_id: bid.auction_id,
    auction_status: auction?.status,
  });
}

export default function SalesroomPage() {
  const [salesroom, setSalesroom] = useState<Salesroom | null>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [amountInput, setAmountInput] = useState<string>('');
  const [bidderNameInput, setBidderNameInput] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [salesroomId, setSalesroomId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

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

  // Timer pour ends_at / compte à rebours
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Chargement initial SalesRoom + Auction + Bids
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

        // 1) SalesRoom
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

        // 2) Encan le plus récent
        const {
          data: auctionData,
          error: auctionError,
        } = await supabase
          .from('auctions')
          .select(
            'demo, salesroom_id, status, start_price, reserve_price, ends_at'
          )
          .eq('salesroom_id', salesroomId)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (auctionError) {
          console.error(
            'Auction error detail:',
            JSON.stringify(auctionError, null, 2)
          );
          setError('Erreur lors du chargement de l’encan.');
          setAuction(null);
          setBids([]);
          setLoading(false);
          return;
        }

        if (!auctionData) {
          setAuction(null);
          setBids([]);
          setLoading(false);
          return;
        }

        const typedAuction = auctionData as Auction;
        setAuction(typedAuction);

        // 3) Bids liés à cet encan
        const {
          data: bidsData,
          error: bidsError,
        } = await supabase
          .from('bids')
          .select('id, auction_id, amount, bidder_name, created_at')
          .eq('auction_id', typedAuction.demo)
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
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in loadData:', err);
        setError('Une erreur inattendue est survenue.');
        setLoading(false);
      }
    }

    loadData();
  }, [salesroomId]);

  // Realtime sur les INSERT de bids
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
        (payload) => {
          const newBid = payload.new as Bid;
          setBids((prev) => {
            const exists = prev.some((b) => b.id === newBid.id);
            if (exists) return prev;
            return [newBid, ...prev];
          });

          // Avatar IA : nouvelle mise reçue via Realtime
          handleBidEvent(newBid, salesroom, auction);
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
    const highestBid = Math.max(...bids.map((b) => b.amount));
    return highestBid + 1;
  }, [auction, bids]);

  const auctionEnded = hasAuctionEnded(auction, now);
  const auctionIsOpen = !!auction && !auctionEnded;
  const endsAtLabel =
    auction && auction.ends_at
      ? new Date(auction.ends_at).toLocaleString('fr-CA')
      : 'Non définie';
  const remainingLabel = getRemainingTimeLabel(auction, now);

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
          bidder_name: bidderNameInput.trim() || null,
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

      // Avatar IA : nouvelle mise placée depuis cette page
      handleBidEvent(newBid, salesroom, auction);

      setAmountInput('');
      setBidderNameInput('');
      setSubmitting(false);
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err);
      setFormError('Une erreur inattendue est survenue lors de la mise.');
      setSubmitting(false);
    }
  }

  const isLoadingOrNoSalesroom = loading && !salesroom && !error;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          SalesRoom &amp; Encan
        </h1>

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
                    <p className="text-xs text-gray-500">Fin de l&apos;encan</p>
                    <p className="mt-1 font-semibold">{endsAtLabel}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3 sm:col-span-4">
                    <p className="text-xs text-gray-500">Temps restant</p>
                    <p className="mt-1 font-semibold">
                      {auctionEnded ? 'Terminé' : remainingLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {auction && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Ajouter une mise
            </h3>

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
                  Nom de l&apos;enchérisseur (optionnel)
                </label>
                <input
                  id="bidder_name"
                  type="text"
                  value={bidderNameInput}
                  onChange={(e) => setBidderNameInput(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 placeholder-opacity-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nom de l’enchérisseur (optionnel)"
                  disabled={!auctionIsOpen || submitting}
                />
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





































