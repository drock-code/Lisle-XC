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

export interface RunnerProfileRow extends RowDataPacket {
  Key: number;
  Name: string;
  Grade: number;
  Gender: string;
  AvatarURL: string | null;
}

export interface RunnerResultRow extends RowDataPacket {
  MeetName: string;
  Date: Date;
  Season: number;
  Distance: string;
  DistanceUnit: string;
  Time: string;
  Grade: number;
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

/* RUNNER PROFILE QUERIES */
  export async function getRunnerProfile(runnerId: number | string) {
    // Fetch the basic runner information
    const [runnerRows] = await pool.query<RunnerProfileRow[]>(
      'SELECT `Key`, `Name`, `Grade`, `Gender`, `AvatarURL` FROM Runner WHERE `Key` = ?',
      [runnerId]
    );

    if (runnerRows.length === 0) {
      return null;
    }

    // Fetch all of their historical race results
    const [resultRows] = await pool.query<RunnerResultRow[]>(
      `SELECT 
          m.Name AS MeetName,
          m.Date,
          m.Season,
          rt.Distance,
          rt.DistanceUnit,
          rr.Time,
          rr.Grade,
          mr.JH
      FROM RunnerResult rr
      JOIN MeetRace mr ON rr.RaceID = mr.RaceKey
      JOIN Meet m ON mr.MeetID = m.MeetKey
      JOIN Route rt ON mr.RouteKey = rt.RouteKey
      WHERE rr.RunnerID = ? AND rr.Time != '00:00:00'
      ORDER BY m.Date ASC`,
      [runnerId]
    );

    return {
      runner: runnerRows[0],
      results: resultRows
    };
  }
/* END OF RUNNER PROFILE QUERIES */

/* SEARCH QUERIES */
  export async function searchRunners(searchTerm: string) {
    const searchPattern = `%${searchTerm}%`;

    const [rows] = await pool.query<RunnerProfileRow[]>(
      'SELECT `Key`, `Name`, `Grade`, `Gender`, `AvatarURL` FROM Runner WHERE `Name` LIKE ? ORDER BY `Name` ASC LIMIT 50',
      [searchPattern]
    );

    return rows;
  }
/* END OF SEARCH QUERIES */