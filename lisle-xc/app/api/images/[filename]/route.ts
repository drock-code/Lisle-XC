import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Await the params to get the filename
    const { filename } = await params; 
    
    const filePath = path.join(process.cwd(), "uploads", "editor", filename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Read the file buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Determine basic content type from extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg"; // Default
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";

    // Return the image directly to the browser
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}