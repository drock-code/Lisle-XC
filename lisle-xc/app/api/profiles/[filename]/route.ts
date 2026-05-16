import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  props: { params: Promise<{ filename: string }> }
) {
  const params = await props.params;
  
  // path.basename is a security measure to prevent hackers from trying to read other server files using "../../../"
  const safeFilename = path.basename(params.filename);
  const filePath = path.join(process.cwd(), 'uploads', 'profiles', safeFilename);

  // If the file doesn't exist, return a standard 404
  if (!fs.existsSync(filePath)) {
    return new NextResponse('Image Not Found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  // Figure out the right content type based on the file extension
  const ext = safeFilename.split('.').pop()?.toLowerCase();
  let contentType = 'image/jpeg';
  if (ext === 'png') contentType = 'image/png';
  if (ext === 'webp') contentType = 'image/webp';
  if (ext === 'gif') contentType = 'image/gif';

  // Send the image back to the browser
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      // Tell the browser to cache this image so it loads super fast next time
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}