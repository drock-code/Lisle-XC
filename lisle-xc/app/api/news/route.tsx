import { NextResponse } from 'next/server';
import { getTotalNewsCount, getNewsPosts } from '@/lib/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const limit = 1; 
  const offset = (page - 1) * limit;

  try {
    const totalCount = await getTotalNewsCount();
    const totalPages = Math.ceil(totalCount / limit);

    const posts = await getNewsPosts(limit, offset);

    return NextResponse.json({
      post: posts[0] || null,
      totalPages
    });
    
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}