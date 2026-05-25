import { NextResponse } from 'next/server';
import { getExistingMeetResults } from '@/lib/admin-queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meetKey = searchParams.get('meetKey');
  const routeKey = parseInt(searchParams.get("routeKey") || "0", 10);

  if (!meetKey || !routeKey) {
      return NextResponse.json({ error: "Missing meetKey or routeKey" }, { status: 400 });
    }

  try {
    const existingResults = await getExistingMeetResults(Number(meetKey), Number(routeKey));
    return NextResponse.json(existingResults);
  } catch (error) {
    console.error("Failed to fetch existing results:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}