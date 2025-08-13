// components/PhotoCard.tsx
"use client";

import { useState } from "react";

export default function PhotoCard({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className={`photo ${loaded ? "is-loaded" : ""}`}>
      <img src={src} alt={title} onLoad={() => setLoaded(true)} loading="lazy" />
      {/* <figcaption>{title}</figcaption> */}
    </figure>
  );
}
