import { NextResponse } from 'next/server';
import { getResultYears } from '@/lib/queries';

export async function GET() {
  try {
    const years = await getResultYears();
    return NextResponse.json(years); 
  } catch (error) {
    console.error("Failed to fetch result years:", error);
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
  }
}