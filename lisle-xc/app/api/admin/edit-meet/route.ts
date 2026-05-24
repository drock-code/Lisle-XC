import { NextResponse } from "next/server";
import { updateMeet } from "@/lib/admin-queries"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, meet, date, time, location, level, info } = body;

    if (!id || !meet || !date) {
      return NextResponse.json(
        { error: "Missing required fields (id, meet, or date)." },
        { status: 400 }
      );
    }

    await updateMeet(
      id, 
      meet, 
      date, 
      time || null, 
      location || null, 
      level || null, 
      info || null
    );

    return NextResponse.json({ success: true, message: "Meet updated successfully." });
  } catch (error) {
    console.error("Error updating meet:", error);
    return NextResponse.json(
      { error: "Failed to update the meet." },
      { status: 500 }
    );
  }
}