'use client';

export type RoomClientProps = {
  pitchId: number;
};

export function RoomClient(props: RoomClientProps) {
  const { pitchId } = props;

  return (
    <div>
      <p>Room client pour le pitch #{pitchId}</p>
    </div>
  );
}
































