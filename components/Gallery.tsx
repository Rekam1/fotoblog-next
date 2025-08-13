// components/Gallery.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import PhotoCard from "./PhotoCard";

type Photo = { id: string; title: string; src: string };

export default function Gallery({ initial }: { initial: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite Scroll per IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(async (entries) => {
      const first = entries[0];
      if (first.isIntersecting && !loading) {
        setLoading(true);
        try {
          const res = await fetch(`/api/photos?page=${page}`, { cache: "no-store" });
          if (res.ok) {
            const more: Photo[] = await res.json();
            if (more.length) {
              setPhotos((p) => [...p, ...more]);
              setPage((p) => p + 1);
            } else {
              // nichts mehr zu laden → Observer trennen
              io.disconnect();
            }
          }
        } finally {
          setLoading(false);
        }
      }
    }, { rootMargin: "800px 0px" }); // früh laden
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [page, loading]);

  return (
    <>
      <div className="masonry">
        {photos.map((p) => (
          <PhotoCard key={p.id + p.src} src={p.src} title={p.title} />
        ))}
      </div>
      <div ref={sentinelRef} className="sentinel">
        {loading ? "Lade mehr Fotos…" : ""}
      </div>
    </>
  );
}
