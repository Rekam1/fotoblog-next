// app/page.tsx
import Gallery from "@/components/Gallery";
import { fetchPhotos } from "@/lib/drupal";
import { NextRequest } from "next/server";

// 1. Server – erste Seite
export default async function Page() {
  const first = await fetchPhotos(0, 24);
  return (
    <main className="wrap">
      <header className="hero">
        <h1>Christians Fotoreise</h1>
        <p>Entdecke Natur, Stille und besondere Momente.</p>
      </header>
      <Gallery initial={first} />
      <footer className="site-footer">
        © {new Date().getFullYear()} Christians Photo
      </footer>
    </main>
  );
}

// 2. API Route fürs Infinite Scroll (Edge-ähnlich via Route Handler)
export async function GET(req: NextRequest) {
  const pageParam = Number(req.nextUrl.searchParams.get("page") || "0");
  const more = await fetchPhotos(pageParam, 24);
  return new Response(JSON.stringify(more), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
