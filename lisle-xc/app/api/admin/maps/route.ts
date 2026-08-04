import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCourseMaps } from "@/lib/queries"; // Update path if needed
import { insertCourseMap, updateCourseMap, deleteCourseMap } from "@/lib/admin-queries"; // Update path if needed

export async function GET() {
  try {
    const maps = await getCourseMaps();
    return NextResponse.json(maps);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch maps" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, location, fileName, description } = await req.json();
    
    await insertCourseMap(name, location, fileName, description);
    
    // Instantly breaks the cache for your frontend maps page!
    revalidatePath("/maps"); 
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create map" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, location, fileName, description } = await req.json();
    
    await updateCourseMap(id, name, location, fileName, description);
    
    revalidatePath("/maps");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update map" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
    
    await deleteCourseMap(Number(id));
    
    revalidatePath("/maps");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete map" }, { status: 500 });
  }
}