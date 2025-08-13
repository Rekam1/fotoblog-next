// lib/drupal.ts
const BASE = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;
const USER = process.env.DRUPAL_BASIC_USER || "";
const PASS = process.env.DRUPAL_BASIC_PASS || "";

function authHeader() {
  if (!USER || !PASS) return {};
  const token = Buffer.from(`${USER}:${PASS}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

/**
 * Holt Foto-Nodes inklusive verknüpfter Medien (Bild) paginiert.
 * @param page 0-basiert
 * @param pageSize Anzahl pro Seite
 */
export async function fetchPhotos(page = 0, pageSize = 24) {
  // Passe den Feldnamen "field_fotodatei" ggf. an deinen Medien-Referenz-Feldnamen im Content Type "foto" an.
  const url = new URL(`${BASE}/jsonapi/node/foto`);
  url.searchParams.set("include", "field_fotodatei,field_fotodatei.field_media_image");
  url.searchParams.set("sort", "-created");
  url.searchParams.set("page[offset]", String(page * pageSize));
  url.searchParams.set("page[limit]", String(pageSize));
  // Felder begrenzen (performanter)
  url.searchParams.append("fields[node--foto]", "title,created,field_fotodatei");
  url.searchParams.append("fields[media--image]", "field_media_image");
  url.searchParams.append("fields[file--file]", "uri,url");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.api+json",
      ...authHeader(),
      // CORS: Drupal JSON:API CORS ist bei dir ja schon offen ✔
    },
    // ISR freundlich
    next: { revalidate: 60 }, // 60s Revalidate auf Vercel (ISR)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drupal fetch failed: ${res.status} ${text}`);
  }

  const json = await res.json();

  // Hilfsindex der "included" Daten
  const included: Record<string, any> = {};
  for (const inc of json.included || []) {
    included[`${inc.type}::${inc.id}`] = inc;
  }

  // Baue eine einfache Liste: {id, title, src, width, height}
  const items = (json.data || []).map((node: any) => {
    const rel = node?.relationships?.field_fotodatei?.data;
    let fileUrl = "";
    if (rel && rel.type === "media--image") {
      const media = included[`media--image::${rel.id}`];
      const fileRel = media?.relationships?.field_media_image?.data;
      if (fileRel && fileRel.type === "file--file") {
        const file = included[`file--file::${fileRel.id}`];
        // 1) Wenn Modul "JSON:API Image Styles" aktiv ist: file?.attributes?.image_style_uri?.['large'] o.ä.
        // 2) Fallback: öffentliche URL verwenden
        fileUrl = file?.attributes?.url || "";
        // Wenn "url" leer ist, baue aus uri -> public path (einfacher Fallback):
        if (!fileUrl && file?.attributes?.uri?.url) fileUrl = file.attributes.uri.url;
      }
    }

    return {
      id: node.id,
      title: node.attributes?.title || "",
      src: fileUrl, // absolute URL
    };
  }).filter((x: any) => !!x.src);

  return items;
}
