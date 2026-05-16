import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createRunner } from "@/lib/admin-queries";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { name, email, gender, grade, graduationYear } = body;

    if (!name || !gender || !grade || !graduationYear) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const newId = await createRunner({
      name,
      email: email || null,
      gender,
      grade: parseInt(grade),
      graduationYear: parseInt(graduationYear),
    });

    return NextResponse.json({ id: newId });
  } catch (error) {
    console.error("Error creating runner:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}