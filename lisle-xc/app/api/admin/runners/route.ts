import { NextResponse } from 'next/server';
import { getAllRunners } from '@/lib/admin-queries';

export async function GET() {
  try {
    const runners = await getAllRunners();
    return NextResponse.json(runners);
  } catch (error) {
    return new NextResponse("Database Error", { status: 500 });
  }
}