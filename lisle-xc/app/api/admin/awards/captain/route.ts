import { NextResponse } from "next/server";
import { insertCaptain, deleteCaptain } from "@/lib/admin-queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, runnerKey, name } = body;

    if (!year || !runnerKey || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await insertCaptain(year, runnerKey, name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding captain:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await deleteCaptain(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting captain:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}