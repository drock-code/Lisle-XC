import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllFAQs, 
  insertFAQ, 
  updateFAQ, 
  deleteFAQ, 
  updateFAQOrder 
} from '@/lib/admin-queries';

export async function GET() {
  try {
    const faqs = await getAllFAQs();
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, order } = await req.json();
    
    if (!title || !content || order === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await insertFAQ(title, content, order);
    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { key, title, content } = await req.json();
    
    if (!key || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await updateFAQ(key, title, content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { updates } = await req.json();
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid updates format" }, { status: 400 });
    }

    // Process all order updates concurrently for maximum performance
    await Promise.all(
      updates.map((update: { Key: number; Order: number }) => 
        updateFAQOrder(update.Key, update.Order)
      )
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    return NextResponse.json({ error: "Failed to reorder FAQs" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: "FAQ key is required" }, { status: 400 });
    }

    await deleteFAQ(Number(key));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}