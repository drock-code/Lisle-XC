import { NextResponse } from "next/server";
import { deleteMeet } from "@/lib/admin-queries"; 

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Meet ID is required for deletion." },
        { status: 400 }
      );
    }

    await deleteMeet(parseInt(id, 10));

    return NextResponse.json({ success: true, message: "Meet deleted successfully." });
  } catch (error) {
    console.error("Error deleting meet:", error);
    return NextResponse.json(
      { error: "Failed to delete the meet." },
      { status: 500 }
    );
  }
}