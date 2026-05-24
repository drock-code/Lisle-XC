import { NextResponse } from "next/server";
import { readdir, mkdir } from "fs/promises";
import path from "path";

// Recursively crawl directories
async function getFilesRecursive(currentDir: string, baseDir: string): Promise<string[]> {
  // withFileTypes: true tells Node to return objects that know if they are a file or a folder
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    // Skip hidden files/folders (like .DS_Store on Macs)
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(currentDir, entry.name);
    
    // Get the path relative to the base 'public/files' directory
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      // If it's a folder, recursively crawl inside it!
      const subFiles = await getFilesRecursive(fullPath, baseDir);
      files.push(...subFiles);
    } else {
      // If it's a file, add it to our list.
      // We also replace Windows backslashes (\) with standard URL forward slashes (/)
      files.push(relativePath.replace(/\\/g, '/'));
    }
  }
  
  return files;
}

export async function GET() {
  try {
    const baseDirectoryPath = path.join(process.cwd(), "public", "files");

    // Ensure the base directory exists so the server doesn't crash if it's completely empty
    await mkdir(baseDirectoryPath, { recursive: true });
    const fileList = await getFilesRecursive(baseDirectoryPath, baseDirectoryPath);

    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error("Error reading files:", error);
    return NextResponse.json({ files: [] });
  }
}