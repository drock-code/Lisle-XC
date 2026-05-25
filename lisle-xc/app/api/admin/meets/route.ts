import { NextResponse } from "next/server";
import { insertMeet, getMeets } from "@/lib/admin-queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");

    // Convert to a number if it exists, otherwise pass undefined
    const year = yearParam ? Number(yearParam) : undefined;
    
    const meets = await getMeets(year);

    return NextResponse.json(meets);
    
  } catch (error: unknown) {
    console.error("Error fetching meets:", error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: `Failed to fetch meets: ${error.message}` }, { status: 500 });
    }
    
    return NextResponse.json({ error: "An unknown error occurred while fetching meets." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, date, season } = body;

    if (!name || !date || !season) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const savedMeet = await insertMeet(name, date, Number(season));

    return NextResponse.json(savedMeet);
  } catch (error: unknown) {
    console.error("Error in meet POST route:", error);
    const message = error instanceof Error ? error.message : "Failed to create meet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}