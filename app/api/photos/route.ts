// app/api/photos/route.ts
import { NextRequest } from "next/server";
import { fetchPhotos } from "@/lib/drupal";

export async function GET(req: NextRequest) {
  try {
    const pageParam = Number(req.nextUrl.searchParams.get("page") || "0");
    const more = await fetchPhotos(pageParam);
    return new Response(JSON.stringify(more), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("API /photos error:", err?.message || err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
