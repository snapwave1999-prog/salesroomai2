// app/room2/page.tsx
import { RoomClient, type RoomClientProps } from './room-client';

export default function Room2Page() {
  const pitchId: RoomClientProps['pitchId'] = 1; // ou la vraie valeur

  return <RoomClient pitchId={pitchId} />;
}






















