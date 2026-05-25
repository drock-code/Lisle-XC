import { NextResponse } from 'next/server';
import { getExistingMeetResults } from '@/lib/admin-queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meetKey = searchParams.get('meetKey');

  if (!meetKey) {
    return NextResponse.json({ error: 'MeetKey is required' }, { status: 400 });
  }

  try {
    const existingResults = await getExistingMeetResults(Number(meetKey));
    return NextResponse.json(existingResults);
  } catch (error) {
    console.error("Failed to fetch existing results:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}