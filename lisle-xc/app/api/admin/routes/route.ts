import { NextResponse } from 'next/server';
import { insertRoute, getRoutes } from '@/lib/admin-queries';

export async function GET() {
  try {
    const runners = await getRoutes();
    return NextResponse.json(runners);
  } catch (error) {
    return new NextResponse("Database Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, distance, distanceUnit } = body;

    if (!name || !distance || !distanceUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const savedRoute = await insertRoute(name, Number(distance), distanceUnit);

    return NextResponse.json(savedRoute);
  } catch (error: unknown) {
    console.error("Error in route POST route:", error);
    const message = error instanceof Error ? error.message : "Failed to create route";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}