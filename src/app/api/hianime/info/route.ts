import { NextRequest, NextResponse } from "next/server";
import { hiAnimeGetInfo } from "@/providers/hianime";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Missing anime id parameter" },
      { status: 400 }
    );
  }

  try {
    const data = await hiAnimeGetInfo(id);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch info" },
      { status: 500 }
    );
  }
}
