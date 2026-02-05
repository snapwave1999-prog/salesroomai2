// app/room2/page.tsx
import RoomClient from './room-client';

type PageProps = {
  searchParams?: Promise<{
    id?: string;
  }>;
};

export default async function Room2Page({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const idParam = resolvedSearchParams.id;
  const pitchId = idParam ? Number(idParam) : null;

  if (!pitchId || Number.isNaN(pitchId)) {
    return (
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 24, color: 'white' }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Salle d&apos;encan</h1>
        <p>Paramètre &quot;id&quot; manquant ou invalide dans l&apos;URL.</p>
      </main>
    );
  }

  return <RoomClient pitchId={pitchId} />;
}




















