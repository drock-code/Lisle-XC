import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTravelInfo } from "@/lib/queries";
import { insertTravelInfo, updateTravelInfo, deleteTravelInfo } from "@/lib/admin-queries";

// Prevent Next.js from caching the GET request indefinitely
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const info = await getTravelInfo();
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch travel info" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await insertTravelInfo(body);
    revalidatePath("/travel-info"); 
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create travel info" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    await updateTravelInfo(body);
    revalidatePath("/travel-info");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update travel info" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await deleteTravelInfo(Number(id));
    revalidatePath("/travel-info");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete travel info" }, { status: 500 });
  }
}