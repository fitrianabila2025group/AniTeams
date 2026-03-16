import { NextRequest, NextResponse } from "next/server";
import { HiAnimeEpisodeProvider } from "@/providers/hianime";

const episodeProvider = new HiAnimeEpisodeProvider();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Missing anime id parameter" },
      { status: 400 }
    );
  }

  const result = await episodeProvider.getEpisodes(0, id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to fetch episodes" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    episodes: result.data,
    totalEpisodes: result.data?.length ?? 0,
  });
}
