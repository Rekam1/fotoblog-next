// app/api/photos/route.ts
import { NextRequest } from "next/server";
import { fetchPhotos } from "@/lib/drupal";

export async function GET(req: NextRequest) {
  const pageParam = Number(req.nextUrl.searchParams.get("page") || "0");
  const more = await fetchPhotos(pageParam); // <-- nur EIN Argument
  return new Response(JSON.stringify(more), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
