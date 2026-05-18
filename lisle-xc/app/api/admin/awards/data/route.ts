import { NextResponse } from "next/server";
import { getAwardsDataForYear } from "@/lib/admin-queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    
    // If yearParam doesn't exist, pass null so the database can pick the latest roster year
    const year = yearParam ? parseInt(yearParam) : null;
    const data = await getAwardsDataForYear(year);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching awards data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}