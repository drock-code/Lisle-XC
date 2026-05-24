import { NextResponse } from "next/server";
import { deleteRaceFile, updateRaceFileTitle } from "@/lib/admin-queries";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await deleteRaceFile(parseInt(id, 10));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting race file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title } = await request.json();
    
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    await updateRaceFileTitle(parseInt(id, 10), title);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating race file:", error);
    return NextResponse.json({ error: "Failed to update title" }, { status: 500 });
  }
}