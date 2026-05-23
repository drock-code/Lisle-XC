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

    // Convert the file into a Node.js Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean up the filename and add a timestamp to prevent overwriting existing files
    const cleanFileName = file.name.replace(/\s+/g, '-').toLowerCase();
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;

    // UPDATED: Define the absolute path to public/images
    const uploadDir = path.join(process.cwd(), "public", "images");

    // Ensure the directory exists (this creates it if it doesn't!)
    await mkdir(uploadDir, { recursive: true });

    // Save the file to the disk
    const filepath = path.join(uploadDir, uniqueFileName);
    await writeFile(filepath, buffer);

    // UPDATED: Return the correct public URL so the editor can display it
    const publicUrl = `/images/${uniqueFileName}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}