// app/page.tsx
import Gallery from "@/components/Gallery";
import { fetchPhotos } from "@/lib/drupal";

export const revalidate = 60; // ISR

export default async function Page() {
  const first = await fetchPhotos(0);
  return (
    <main className="wrap">
      <header className="hero">
        <h1>Christians Fotoreise</h1>
        <p>Entdecke Natur, Stille und besondere Momente.</p>
      </header>
      <Gallery initial={first} />
      <footer className="site-footer">© {new Date().getFullYear()} Christians Photo</footer>
    </main>
  );
}
