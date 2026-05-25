import { NextResponse } from "next/server";
import { getRoster } from "@/lib/queries"; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const isJhParam = searchParams.get("isJh"); 

    if (!yearParam) {
      return NextResponse.json({ error: "Year parameter is required" }, { status: 400 });
    }

    const year = Number(yearParam);
    const level = isJhParam === "1" ? "JH" : "HS";

    const rows = await getRoster(year, level, 'name');

    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error("Error fetching team roster segment:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An error occurred retrieving the roster." }, { status: 500 });
  }
}