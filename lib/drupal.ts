// lib/drupal.ts

// Optional: Lies den kompletten Authorization-Header (z.B. "Basic abcd...") aus env
function getAuthHeader(): string | undefined {
  return process.env.DRUPAL_AUTH_HEADER; // z.B. "Basic abcd..."
}

export async function fetchDrupal<T>(url: URL): Promise<T> {
  // immer konkretes Record statt Union bauen
  const headers: Record<string, string> = {
    Accept: 'application/vnd.api+json',
  };

  const auth = getAuthHeader();
  if (auth) headers.Authorization = auth;

  const res = await fetch(url.toString(), { headers }); // headers ist Record<string,string> -> ok

  if (!res.ok) {
    throw new Error(`Drupal request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
