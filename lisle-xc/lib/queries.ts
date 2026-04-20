import { pool } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export interface ScheduleRow extends RowDataPacket {
  ID: number;
  Meet: string;
  Date: Date;
  Time: string | null;
  Location: string | null;
  Level: string | null;
  Info: string | null;
}

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
    'SELECT * FROM Schedule WHERE YEAR(Date) = ? ORDER BY Date ASC',
    [year]
  );
  return rows;
}