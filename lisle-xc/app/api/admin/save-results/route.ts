import { NextResponse } from "next/server";
import { saveMeetResults } from "@/lib/admin-queries";

export async function POST(request: Request) {
  try {
    const { meetKey, routeKey, isJh, results, date } = await request.json();
    await saveMeetResults(meetKey, routeKey, isJh, results, date);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
}