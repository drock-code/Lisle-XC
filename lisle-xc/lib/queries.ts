import { pool } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export interface MeetResult {
  ID: number;
  Title: string;
  File: string;
}

export interface ScheduleRow extends RowDataPacket {
  ID: number;
  Meet: string;
  Date: Date;
  Time: string | null;
  Location: string | null;
  Level: string | null;
  Info: string | null;
  Results: MeetResult[] | null;
}

export interface FAQRow extends RowDataPacket {
  Key: number;
  Order: number;
  Title: string;
  Content: string;
}

/* SCHEDULE QUERIES */
  // Automatically find all years that have meets in the database
  export async function getAvailableYears() {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT DISTINCT YEAR(Date) as Year FROM Schedule ORDER BY Year DESC'
    );
    // Convert the array of objects into a simple array of strings: ['2026', '2025', ...]
    return rows.map((row) => row.Year.toString());
  }

  // Fetch the schedule for a specific year
  export async function getScheduleByYear(year: string) {
    const [rows] = await pool.query<ScheduleRow[]>(
      `SELECT 
        s.*,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('ID', r.ID, 'Title', r.Title, 'File', r.File)
          )
          FROM RaceFile r
          WHERE r.RaceID = s.ID
        ) AS Results
      FROM Schedule s 
      WHERE YEAR(s.Date) = ? 
      ORDER BY s.Date ASC`,
      [year]
    );
    
    // Ensure the Results column is proper JSON
    return rows.map(row => ({
      ...row,
      Results: typeof row.Results === 'string' ? JSON.parse(row.Results) : row.Results
    }));
  }

  // Find the next two upcoming meets in the schedule
  export async function getUpcomingMeets(limit: number = 2) {
    const [rows] = await pool.query<ScheduleRow[]>(
      `SELECT 
        s.*,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('ID', r.ID, 'Title', r.Title, 'File', r.File)
          )
          FROM RaceFile r
          WHERE r.RaceID = s.ID
        ) AS Results
      FROM Schedule s 
      WHERE Date >= CURDATE() 
      ORDER BY Date ASC 
      LIMIT ?`,
      [limit]
    );

    // Ensure the Results column is properly parsed into a JavaScript array
    return rows.map(row => ({
      ...row,
      Results: typeof row.Results === 'string' ? JSON.parse(row.Results) : row.Results
    }));
  }
/* END OF SCHEDULE QUERIES */

/* FAQ QUERIES */
  export async function getFAQs() {
    const [rows] = await pool.query<FAQRow[]>(
      'SELECT `Key`, `Order`, `Title`, `Content` FROM FAQ ORDER BY `Order` ASC'
    );
    return rows;
  }

  export async function getRandomFAQ() {
    const [rows] = await pool.query<FAQRow[]>(
      'SELECT `Key`, `Title`, `Content` FROM FAQ ORDER BY RAND() LIMIT 1'
    );
    return rows.length > 0 ? rows[0] : null;
  }
/* END OF FAQ QUERIES */