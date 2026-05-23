import { NextResponse } from "next/server";
import { readdir, mkdir } from "fs/promises";
import path from "path";

async function getImagesRecursive(currentDir: string, baseDir: string): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      const subFiles = await getImagesRecursive(fullPath, baseDir);
      files.push(...subFiles);
    } else {
      // Filter for image formats only
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
        files.push(relativePath.replace(/\\/g, '/'));
      }
    }
  }
  return files;
}

export async function GET() {
  try {
    const baseDirectoryPath = path.join(process.cwd(), "public", "images");
    await mkdir(baseDirectoryPath, { recursive: true });
    const imageList = await getImagesRecursive(baseDirectoryPath, baseDirectoryPath);
    return NextResponse.json({ files: imageList });
  } catch (error) {
    console.error("Error reading images:", error);
    return NextResponse.json({ files: [] });
  }
}