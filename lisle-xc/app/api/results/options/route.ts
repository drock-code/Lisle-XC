import { NextResponse } from 'next/server';
import {getResultsFilterOptions} from '@/lib/queries';

export async function GET() {
  try {
    const options = await getResultsFilterOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("Options Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
  }
}