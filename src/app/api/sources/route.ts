import { NextRequest, NextResponse } from "next/server";
import { HiAnimeEpisodeProvider } from "@/providers/hianime";

const episodeProvider = new HiAnimeEpisodeProvider();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  const server = searchParams.get("server") ?? undefined;
  const category = searchParams.get("category") ?? "sub";

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Missing episode id parameter" },
      { status: 400 }
    );
  }

  if (!["sub", "dub", "raw"].includes(category)) {
    return NextResponse.json(
      { error: "Invalid category. Must be sub, dub, or raw" },
      { status: 400 }
    );
  }

  const result = await episodeProvider.getEpisodeSources(
    id,
    server,
    category as "sub" | "dub" | "raw"
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to fetch sources" },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
