import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // Attempt to fetch the HTML
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Blocked by target website. Please use the Smart Paste fallback." }, { status: 403 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const parsedData: any[] = [];

    // Basic heuristic: look for table rows with times
    const timeRegex = /\b\d{1,2}:\d{2}(\.\d{1,2})?\b/;
    
    $("tr").each((_, row) => {
      const text = $(row).text();
      const timeMatch = text.match(timeRegex);
      
      if (timeMatch) {
        // Grab the first column text as the name assumption
        const possibleName = $(row).find("td").first().text().trim() || $(row).find("a").first().text().trim();
        if (possibleName) {
          parsedData.push({
            id: Math.random().toString(36).substring(7),
            rawName: possibleName,
            time: timeMatch[0],
            runnerKey: null,
            grade: ""
          });
        }
      }
    });

    return NextResponse.json({ results: parsedData });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ error: "Failed to scrape URL" }, { status: 500 });
  }
}