import { NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import { getScheduleForYear, insertMeet } from "@/lib/admin-queries";

// --- GET: Fetch schedule data ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    
    const year = yearParam ? parseInt(yearParam) : null;
    const data = await getScheduleForYear(year);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// --- POST: Add a new meet ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { meet, date, time, location, level, info } = body;

    if (!meet || !date) {
      return NextResponse.json(
        { error: "Meet name and date are required" },
        { status: 400 }
      );
    }

    // Sanitize the HTML! This removes <script> tags and bad attributes while keeping formatting, lists, and images safe.
    const sanitizedInfo = info ? DOMPurify.sanitize(info) : null;

    await insertMeet(meet, date, time, location, level, sanitizedInfo);

    return NextResponse.json({ success: true, message: "Meet added successfully" });
  } catch (error) {
    console.error("Error adding meet:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}