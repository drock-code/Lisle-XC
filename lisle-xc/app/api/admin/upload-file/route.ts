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

    // Keep the original filename but replace spaces with dashes
    const cleanFileName = file.name.replace(/\s+/g, '-');
    const uploadDir = path.join(process.cwd(), "public", "files");

    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, cleanFileName);
    await writeFile(filepath, buffer);

    // Return the URL and the name!
    return NextResponse.json({ 
      url: `admin/files/${cleanFileName}`, 
      name: cleanFileName 
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}