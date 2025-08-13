// app/page.tsx
import Image from "next/image";

type DrupalNode = {
  id: string;
  attributes: { title: string };
  relationships?: {
    field_fotodatei?: { data?: { id: string } | null };
  };
};

type DrupalFile = {
  id: string;
  type: "file--file";
  attributes: {
    uri: { url: string }; // JSON:API: file.attributes.uri.url
  };
};

async function getPhotos() {
  // Passe die URL bei Bedarf an: Feldnamen/Includes/Sortierung
  const API =
    "https://neu.christians.photo.christians.photo/jsonapi/node/foto" +
    "?include=field_fotodatei" +
    "&fields[node--foto]=title,field_fotodatei" +
    "&fields[file--file]=uri" +
    "&sort=-created" +
    "&page[limit]=24";

  const res = await fetch(API, {
    // revalidate = ISR; Seite wird serverseitig gerendert & nach 5 Min. neu validiert
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error("JSON:API request failed");

  const data = await res.json();

  const files = new Map<string, string>();
  (data.included || [])
    .filter((i: any) => i.type === "file--file")
    .forEach((f: DrupalFile) => files.set(f.id, f.attributes.uri.url));

  const items = (data.data as DrupalNode[])
    .map((n) => {
      const fileRel = n.relationships?.field_fotodatei?.data as
        | { id: string }
        | undefined;
      const src = fileRel ? files.get(fileRel.id) : undefined;
      return {
        id: n.id,
        title: n.attributes.title,
        src,
      };
    })
    .filter((p) => p.src);

  return items;
}

export default async function Page() {
  const photos = await getPhotos();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-center text-3xl font-semibold">
        Christians Fotoreise
      </h1>

      {/* responsive Grid – einfache, saubere Gallery */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        }}
      >
        {photos.map((p) => (
          <figure
            key={p.id}
            className="overflow-hidden rounded-xl bg-neutral-900/50 ring-1 ring-white/10"
          >
            {/* Der Image-Host muss in next.config.ts erlaubt sein */}
            <Image
              src={p.src!}
              alt={p.title}
              width={800}
              height={600}
              className="h-auto w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
              unoptimized
              // (falls die Bild-URLs nicht direkt öffentlich sind, vorerst unoptimized)
            />
            <figcaption className="p-3 text-sm text-neutral-300">
              {p.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
