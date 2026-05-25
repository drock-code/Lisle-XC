import { NextResponse } from "next/server";

import { getRosterYears } from "@/lib/queries"; 

export async function GET() {
  try {
    const years = await getRosterYears();

    if (years.length === 0) {
      years.push(new Date().getFullYear());
    }

    return NextResponse.json(years);
  } catch (error: unknown) {
    console.error("Error fetching roster years:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown database error occurred." }, { status: 500 });
  }
}