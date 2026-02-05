"use client";

import { useState } from "react";

export function useCopyLink() {
  const [copied, setCopied] = useState(false);

  const copy = (url: string) => {
    if (!navigator?.clipboard) return;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return { copied, copy };
}


