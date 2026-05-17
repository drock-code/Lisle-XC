import { NextResponse } from 'next/server';
import { deleteRunner } from '@/lib/admin-queries';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new NextResponse("Missing Runner ID", { status: 400 });
    }

    await deleteRunner(parseInt(id));
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Delete runner error:", error);
    if (error.message.includes("Cannot delete runner")) {
      return new NextResponse(error.message, { status: 403 });
    }
    return new NextResponse("Database Error", { status: 500 });
  }
}