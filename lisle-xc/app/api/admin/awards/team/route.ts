import { NextResponse } from "next/server";
import { insertTeamAward, deleteTeamAward } from "@/lib/admin-queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, teamName, award } = body;

    if (!year || !teamName || !award) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await insertTeamAward(year, teamName, award);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding team award:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await deleteTeamAward(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team award:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}