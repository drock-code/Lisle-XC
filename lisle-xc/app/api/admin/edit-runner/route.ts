import { NextResponse } from 'next/server';
import { updateRunner, updateRunnerRoster } from '@/lib/admin-queries';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Update the base profile and recalculate historic Season Years
    await updateRunner(data.id, {
      name: data.name,
      email: data.email || null,
      gender: data.gender,
      grade: data.grade,
      graduationYear: data.graduationYear
    });

    // Update the roster checkboxes
    if (data.activeGrades && Array.isArray(data.activeGrades)) {
      await updateRunnerRoster(data.id, data.activeGrades, data.graduationYear);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return new NextResponse("Database Error", { status: 500 });
  }
}