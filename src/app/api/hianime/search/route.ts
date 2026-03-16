import { NextRequest, NextResponse } from "next/server";
import { hiAnimeSearch, hiAnimeSearchSuggestions } from "@/providers/hianime";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");
  const type = searchParams.get("type") ?? "search";

  if (!q || typeof q !== "string" || q.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 }
    );
  }

  try {
    if (type === "suggestions") {
      const data = await hiAnimeSearchSuggestions(q.trim());
      return NextResponse.json(data);
    }

    const page = Number(searchParams.get("page") ?? "1");
    const data = await hiAnimeSearch(q.trim(), page);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 }
    );
  }
}
