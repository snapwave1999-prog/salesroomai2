"use client";

import { Suspense } from "react";
import SalesroomAvatarInner from "./SalesroomAvatarInner";

export default function SalesroomAvatarPage() {
  return (
    <Suspense fallback={<div>Chargement de l'avatar...</div>}>
      <SalesroomAvatarInner />
    </Suspense>
  );
}
