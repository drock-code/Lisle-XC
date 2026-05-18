import { NextResponse } from "next/server";
import { insertRunnerAward, deleteRunnerAward } from "@/lib/admin-queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, runnerKey, name, award, isJH } = body;

    if (!year || !runnerKey || !name || !award) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await insertRunnerAward(year, runnerKey, name, award, isJH);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding runner award:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await deleteRunnerAward(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting runner award:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}