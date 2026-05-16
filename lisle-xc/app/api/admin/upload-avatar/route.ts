import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateRunnerAvatar } from "@/lib/admin-queries";
import { generateSlug } from "@/lib/utils";
import sharp from "sharp";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const runnerId = formData.get("runnerId") as string;
    const runnerName = formData.get("runnerName") as string;

    if (!file || !runnerId) return new NextResponse("Missing data", { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const slug = generateSlug(runnerName);
    const fileName = `${runnerId}-${slug}.webp`;
    const relativePath = `/api/profiles/${fileName}`;
    const absolutePath = path.join(process.cwd(), "uploads", "profiles", fileName);

    // Process Image with Sharp (Resize and Center Crop to Square)
    await sharp(buffer)
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toFile(absolutePath);

    await updateRunnerAvatar(parseInt(runnerId), relativePath);

    return NextResponse.json({ url: relativePath });
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}