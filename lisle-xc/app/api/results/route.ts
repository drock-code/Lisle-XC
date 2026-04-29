import { NextResponse } from 'next/server';
import { searchMeetResults, getLatestSeason } from '@/lib/queries';

export async function POST(request: Request) {
  try {
    const filters = await request.json();
    
    // If only the level (HS/JH) is provided, default to the latest season
    if (Object.keys(filters).length === 1 && filters.level) {
        const latestSeason = await getLatestSeason();
        filters.startDate = `${latestSeason}-01-01`;
        filters.endDate = `${latestSeason}-12-31`;
    }

    const results = await searchMeetResults(filters);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Results Search Error:", error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}