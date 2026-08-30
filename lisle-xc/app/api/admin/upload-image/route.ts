import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanFileName = file.name.replace(/\s+/g, '-').toLowerCase();
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;

    const uploadDir = path.join(process.cwd(), "uploads", "editor");

    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, uniqueFileName);
    await writeFile(filepath, buffer);

    // Return a URL pointing to the dynamic API route
    const publicUrl = `/api/images/${uniqueFileName}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}