import { NextResponse } from "next/server";
import { getSearchSuggestions, searchSite } from "@/lib/search-db";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";

  try {
    const [results, suggestions] = await Promise.all([
      searchSite(query),
      getSearchSuggestions(),
    ]);

    return NextResponse.json({ results, suggestions });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[search-api] Failed to search catalog:", error);
    }

    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 500 },
    );
  }
}
