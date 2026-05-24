import { NextResponse } from "next/server";
import { getRaceFiles, insertRaceFile } from "@/lib/admin-queries"; 

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const files = await getRaceFiles(parseInt(id, 10));
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching race files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { title, file } = await request.json();
    if (!title || !file) return NextResponse.json({ error: "Title and file required" }, { status: 400 });

    await insertRaceFile(parseInt(id, 10), title, file);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding race file:", error);
    return NextResponse.json({ error: "Failed to attach file" }, { status: 500 });
  }
}