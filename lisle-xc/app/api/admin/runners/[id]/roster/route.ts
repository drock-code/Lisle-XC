import { NextResponse } from 'next/server';
import { getRunnerRosterHistory } from '@/lib/admin-queries'; 

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const history = await getRunnerRosterHistory(parseInt(resolvedParams.id));
    
    return NextResponse.json(history);
  } catch (error) {
    console.error(error);
    return new NextResponse("Database Error", { status: 500 });
  }
}