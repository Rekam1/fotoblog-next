// lib/drupal.ts

export type PhotoItem = { id: string; title: string; src: string };

export async function fetchPhotos(page = 0): Promise<PhotoItem[]> {
  const BASE = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;
  const pageSize = 24;

  const url = new URL(`${BASE}/jsonapi/node/foto`);
  // include: Media (image) + File
  url.searchParams.set("include", "field_fotodatei,field_fotodatei.field_media_image");
  url.searchParams.set("sort", "-created");
  url.searchParams.set("page[offset]", String(page * pageSize));
  url.searchParams.set("page[limit]", String(pageSize));
  url.searchParams.append("fields[node--foto]", "title,field_fotodatei");
  url.searchParams.append("fields[media--image]", "field_media_image");
  url.searchParams.append("fields[file--file]", "uri,url");

  const headers: Record<string, string> = { Accept: "application/vnd.api+json" };
  const auth = process.env.DRUPAL_AUTH_HEADER; // optional: "Basic <base64(user:pass)>"
  if (auth) headers.Authorization = auth;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`Drupal fetch failed: ${res.status} ${res.statusText}`);

  const json = await res.json();

  // included indexieren
  const inc = new Map<string, any>((json.included || []).map((i: any) => [`${i.type}--${i.id}`, i]));

  // auf {id,title,src} mappen
  const items: PhotoItem[] = (json.data || [])
    .map((n: any) => {
      const mediaRel = n?.relationships?.field_fotodatei?.data;
      const media = mediaRel ? inc.get(`${mediaRel.type}--${mediaRel.id}`) : null;
      const fileRel = media?.relationships?.field_media_image?.data;
      const file = fileRel ? inc.get(`${fileRel.type}--${fileRel.id}`) : null;

      let src: string = file?.attributes?.url || file?.attributes?.uri?.url || "";
      if (src && !src.startsWith("http")) src = `${BASE}${src}`;

      return { id: n.id, title: n.attributes?.title || "", src };
    })
    .filter((x: PhotoItem) => x.src);

  return items;
}
