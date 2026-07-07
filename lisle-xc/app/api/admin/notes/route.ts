import { NextResponse } from "next/server";
import { getAllNotes, insertNote, updateNote, deleteNote } from "@/lib/admin-queries"; // Update path if needed

export async function GET() {
  try {
    const notes = await getAllNotes();
    return NextResponse.json(notes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, title, note } = body;

    if (!date || !title || !note) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await insertNote(date, title, note);
    return NextResponse.json({ message: "Note created" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { key, date, title, note } = body;

    if (!key || !date || !title || !note) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await updateNote(key, date, title, note);
    return NextResponse.json({ message: "Note updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

    await deleteNote(Number(key));
    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}