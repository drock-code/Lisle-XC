import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;

    const filePath = path.join(process.cwd(), "public", "files", ...resolvedParams.path);
    
    // Read the file from the filesystem
    const fileBuffer = await readFile(filePath);

    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".txt" || ext === ".csv") contentType = "text/plain";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("File reading error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}