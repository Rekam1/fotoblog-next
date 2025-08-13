// lib/drupal.ts

export async function fetchPhotos(page = 0) {
  const url = new URL(`${process.env.DRUPAL_BASE_URL}/jsonapi/node/photo`);
  url.searchParams.set("page[offset]", (page * 10).toString());
  url.searchParams.set("page[limit]", "10");

  const headers: Record<string, string> = {
    Accept: "application/vnd.api+json",
  };

  const auth = process.env.DRUPAL_AUTH_HEADER;
  if (auth) headers.Authorization = auth;

  const res = await fetch(url.toString(), { headers });

  if (!res.ok) {
    throw new Error(`Fehler beim Laden der Fotos: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
