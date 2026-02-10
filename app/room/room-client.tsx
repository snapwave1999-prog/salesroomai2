'use client';

export type RoomClientProps = {
  pitchId: number;
};

export function RoomClient({ pitchId }: RoomClientProps) {
  return (
    <div>
      <p>Room client pour le pitch #{pitchId}</p>
    </div>
  );
}









