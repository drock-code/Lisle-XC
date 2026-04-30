import { pool } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export interface AwardYear extends RowDataPacket {
  Year: number;
}

export interface CaptainRow extends RowDataPacket {
  Key: number;
  Name: string;
  Year: number;
  RunnerKey: number | null;
  AvatarURL: string | null;
}

export interface FAQRow extends RowDataPacket {
  Key: number;
  Order: number;
  Title: string;
  Content: string;
}

export interface LeaderboardParams {
  gender: string;
  distance?: string;
  course?: string;
  grade?: string;
  limit: number;
  offset: number;
}

export interface LeaderboardResult extends RowDataPacket {
  RunnerID: number;
  RunnerName: string;
  Time: string;
  Date: Date;
  AvatarURL: string | null;
}

export interface DynamicLeaderboardRow extends RowDataPacket {
  RunnerKey: number;
  Name: string;
  AvatarURL: string | null;
  Time: string; 
  Course: string;
  Date: Date | string; 
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface DistanceOptionRow extends RowDataPacket {
  Distance: string | number;
}

interface CourseOptionRow extends RowDataPacket {
  Course: string;
}

export interface MeetResult {
  ID: number;
  Title: string;
  File: string;
}

export interface NoteRow extends RowDataPacket {
  Key: number;
  Date: Date;
  Title: string;
  Note: string;
  Image: string | null;
}

export interface RecordRule extends RowDataPacket {
  Key: number;
  Meet: string;
  Distance: number;
  Grade: number;
  Gender: string;
  MaxRunners: number;
}

export interface RunnerAwardRow extends RowDataPacket {
  Key: number;
  Name: string;
  Award: string;
  IsJH: number;
  Year: number;
  RunnerKey: number | null;
  AvatarURL: string | null;
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

export interface SearchFilters {
  startDate?: string;
  endDate?: string;
  athleteId?: string;
  gender?: string;
  grade?: string;
  routeId?: string;
  distance?: string;
  minTime?: string;
  maxTime?: string;
  level?: 'HS' | 'JH';
  prStatus?: 'Lifetime' | 'Season' | '';
}

export interface TeamAwardRow extends RowDataPacket {
  ID: number;
  TeamName: string;
  Award: string;
  Year: number;
}

/*************************** FAQ QUERIES *********************************/
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
/*************************** END OF FAQ QUERIES *********************************/

/*************************** NEWS QUERIES *********************************/
  // Get the total number of news posts (used for calculating total pages)
  export async function getTotalNewsCount() {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM Note'
    );
    return rows[0].total as number;
  }

  // Fetch a specific page of news posts
  export async function getNewsPosts(limit: number, offset: number) {
    const [rows] = await pool.query<NoteRow[]>(
      'SELECT `Key`, `Date`, `Title`, `Note`, `Image` FROM Note ORDER BY `Date` DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    return rows;
  }
/*************************** END OF NEWS QUERIES *********************************/

/*************************** RECORDS PAGE QUERIES *********************************/
  export async function getAwardYears(): Promise<number[]> {
    // Get unique years from both tables to populate the dropdown
    const [rows] = await pool.query(`
      SELECT DISTINCT Year FROM TeamAward
      UNION
      SELECT DISTINCT Year FROM RunnerAward
      ORDER BY Year DESC
    `);
    return (rows as AwardYear[]).map(r => r.Year);
  }

  export async function getAwardsByYear(year: number) {
    const [teamAwards] = await pool.query<TeamAwardRow[]>(`
      SELECT * FROM TeamAward WHERE Year = ? ORDER BY Award ASC
    `, [year]);

    const [runnerAwards] = await pool.query<RunnerAwardRow[]>(`
      SELECT ra.*, r.AvatarURL 
      FROM RunnerAward ra
      LEFT JOIN Runner r ON ra.RunnerKey = r.Key
      WHERE ra.Year = ?
      ORDER BY ra.Award ASC
    `, [year]);

    return { teamAwards, runnerAwards };
  }

  export async function getCaptains(): Promise<CaptainRow[]> {
    const [rows] = await pool.query<CaptainRow[]>(`
      SELECT c.*, r.AvatarURL 
      FROM Captain c
      LEFT JOIN Runner r ON c.RunnerKey = r.Key
      ORDER BY c.Year DESC, c.Name ASC
    `);
    return rows;
  }

  // 3. Fetch the dynamic leaderboard
export async function getDynamicLeaderboard(params: LeaderboardParams) {
  let baseWhere = `WHERE r.Gender = ? AND rr.Time != '00:00:00'`;
  const queryParams: (string | number)[] = [params.gender];

  if (params.distance) {
    // Filter by the Distance in the Route table
    baseWhere += ` AND ro.Distance = ?`;
    queryParams.push(params.distance);
  }
  if (params.course) {
    baseWhere += ` AND ro.Name = ?`; 
    queryParams.push(params.course);
  }
  if (params.grade) {
    baseWhere += ` AND r.Grade = ?`;
    queryParams.push(params.grade);
  }

  const query = `
    WITH RankedResults AS (
      SELECT 
        r.Key as RunnerKey, 
        r.Name, 
        r.AvatarURL, 
        rr.Time, 
        ro.Name as Course, 
        rr.Date,
        ROW_NUMBER() OVER(PARTITION BY r.Key ORDER BY rr.Time ASC) as rn
      FROM RunnerResult rr
      JOIN Runner r ON rr.RunnerID = r.Key
      /* FIX: Bridge through MeetRace to get the correct Route */
      LEFT JOIN MeetRace mr ON rr.RaceID = mr.RaceKey
      LEFT JOIN Route ro ON mr.RouteKey = ro.RouteKey
      ${baseWhere}
    )
    SELECT * FROM RankedResults 
    WHERE rn = 1
    ORDER BY Time ASC
    LIMIT ? OFFSET ?
  `;

  queryParams.push(params.limit, params.offset);

  const [results] = await pool.query<DynamicLeaderboardRow[]>(query, queryParams);
  
  const countQuery = `
    SELECT COUNT(DISTINCT r.Key) as total
    FROM RunnerResult rr
    JOIN Runner r ON rr.RunnerID = r.Key
    /* FIX: Make sure the count query uses the same bridge! */
    LEFT JOIN MeetRace mr ON rr.RaceID = mr.RaceKey
    LEFT JOIN Route ro ON mr.RouteKey = ro.RouteKey 
    ${baseWhere}
  `;
  
  const countParams = queryParams.slice(0, -2); 
  const [countResult] = await pool.query<CountRow[]>(countQuery, countParams);
  
  return {
    results,
    totalCount: countResult[0].total
  };
}

// 4. Fetch unique options to populate our Select dropdowns
export async function getLeaderboardOptions() {
  // Add ro.DistanceUnit to the SELECT statement
  const [distances] = await pool.query<DistanceOptionRow[]>(
    `SELECT DISTINCT ro.Distance, ro.DistanceUnit 
     FROM RunnerResult rr
     JOIN MeetRace mr ON rr.RaceID = mr.RaceKey
     JOIN Route ro ON mr.RouteKey = ro.RouteKey
     WHERE ro.Distance IS NOT NULL 
     ORDER BY ro.Distance ASC`
  );
  
  const [courses] = await pool.query<CourseOptionRow[]>(
    `SELECT DISTINCT ro.Name as Course 
     FROM RunnerResult rr
     JOIN MeetRace mr ON rr.RaceID = mr.RaceKey
     JOIN Route ro ON mr.RouteKey = ro.RouteKey
     WHERE ro.Name IS NOT NULL 
     ORDER BY ro.Name ASC`
  );
  
  return {
    // Map this to an object with a value AND a label
    distances: distances.map(d => ({
      value: Number(d.Distance).toString(),
      // Fallback to 'Miles' if the database has a blank/null unit
      label: `${Number(d.Distance)} ${d.DistanceUnit || 'Miles'}` 
    })),
    courses: courses.map(c => c.Course)
  };
}

  export async function getRecords() {
    // 1. Fetch the Record rules
    const [rules] = await pool.query<RecordRule[]>(`
      SELECT * FROM Record ORDER BY Meet ASC, Distance ASC, Grade ASC, Gender ASC
    `);

    const records = [];

    // 2. Fetch the Top X results for each record rule (Assuming records only list a runner's best time)
    for (const rule of rules) {
      const [results] = await pool.query<LeaderboardResult[]>(`
        SELECT 
          r.Key as RunnerID, r.Name as RunnerName, r.AvatarURL,
          MIN(rr.Time) as Time
        FROM RunnerResult rr
        JOIN Runner r ON rr.RunnerID = r.Key
        WHERE rr.MeetName = ? AND rr.Distance = ? AND r.Grade = ? AND r.Gender = ?
        GROUP BY r.Key, r.Name, r.AvatarURL
        ORDER BY Time ASC
        LIMIT ?
      `, [rule.Meet, rule.Distance, rule.Grade, rule.Gender, rule.MaxRunners]);

      records.push({ rule, results });
    }

    return records;
  }


/*************************** END OF RECORDS QUERIES *********************************/

/*************************** RESULTS PAGE QUERIES *********************************/
  export async function getResultsFilterOptions() {
    const [runners] = await pool.query<RowDataPacket[]>('SELECT `Key`, `Name` FROM Runner ORDER BY `Name` ASC');
    const [routes] = await pool.query<RowDataPacket[]>('SELECT `RouteKey`, `Name` FROM Route ORDER BY `Name` ASC'); 
    const [distances] = await pool.query<RowDataPacket[]>('SELECT DISTINCT `Distance`, `DistanceUnit` FROM Route ORDER BY `Distance` ASC');
    
    return { runners, routes, distances };
  }

  export async function getLatestSeason() {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT MAX(Season) as Latest FROM Meet');
    return rows[0].Latest as number;
  }

  export async function searchMeetResults(filters: SearchFilters) {
    const formatForDb = (timeStr: string | undefined | null) => {
    if (!timeStr || timeStr.trim() === '') return null;
    
    // If user typed "18:00", convert to "00:18:00"
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return `00:${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    
    // If it's already "00:18:00" or similar, just return it
    return timeStr;
  };
  
    let query = `
      SELECT 
        rr.*,
        m.Name AS MeetName, m.Date, m.Season,
        rt.Distance, rt.DistanceUnit,
        r.AvatarURL, r.Gender,
        
        /* Subquery to check if this is the fastest time EVER for this runner at this distance */
        (rr.Time = (
          SELECT MIN(rr2.Time)
          FROM RunnerResult rr2
          JOIN MeetRace mr2 ON rr2.RaceID = mr2.RaceKey
          JOIN Route rt2 ON mr2.RouteKey = rt2.RouteKey
          WHERE rr2.RunnerID = rr.RunnerID 
          AND rt2.Distance = rt.Distance 
          AND rt2.DistanceUnit = rt.DistanceUnit
          AND rr2.Time != '00:00:00'
        )) AS isLifetimePR,

        /* Subquery to check if this is the fastest time in this SEASON for this runner at this distance */
        (rr.Time = (
          SELECT MIN(rr3.Time)
          FROM RunnerResult rr3
          JOIN MeetRace mr3 ON rr3.RaceID = mr3.RaceKey
          JOIN Meet m3 ON mr3.MeetID = m3.MeetKey
          JOIN Route rt3 ON mr3.RouteKey = rt3.RouteKey
          WHERE rr3.RunnerID = rr.RunnerID 
          AND m3.Season = m.Season
          AND rt3.Distance = rt.Distance 
          AND rt3.DistanceUnit = rt.DistanceUnit
          AND rr3.Time != '00:00:00'
        )) AS isSeasonPR

      FROM RunnerResult rr
      JOIN MeetRace mr ON rr.RaceID = mr.RaceKey
      JOIN Meet m ON mr.MeetID = m.MeetKey
      JOIN Route rt ON mr.RouteKey = rt.RouteKey
      JOIN Runner r ON rr.RunnerID = r.Key
      WHERE rr.Time != '00:00:00'
    `;
    
    const values: (string | number | null)[] = [];

    // Dynamically build the WHERE clause based on provided filters
    if (filters.level) {
      query += ` AND rr.JH = ?`;
      values.push(filters.level === 'JH' ? 1 : 0);
    }
    if (filters.startDate) { query += ` AND m.Date >= ?`; values.push(filters.startDate); }
    if (filters.endDate) { query += ` AND m.Date <= ?`; values.push(filters.endDate); }
    if (filters.athleteId) { query += ` AND rr.RunnerID = ?`; values.push(filters.athleteId); }
    if (filters.gender) { query += ` AND r.Gender = ?`; values.push(filters.gender); }
    if (filters.grade) { query += ` AND rr.Grade = ?`; values.push(filters.grade); }
    if (filters.routeId) { query += ` AND mr.RouteKey = ?`; values.push(filters.routeId); }
    if (filters.distance) { 
      // Assuming distance is passed as "3.0-Miles"
      const [dist, unit] = filters.distance.split('-');
      query += ` AND rt.Distance = ? AND rt.DistanceUnit = ?`; 
      values.push(dist, unit); 
    }
    if (filters.minTime) { 
      // Min Time = "Slowest" allowed. (e.g., Show me everything SLOWER than 18:00)
      query += ` AND rr.Time >= ?`; 
      values.push(formatForDb(filters.minTime)); 
    }
    if (filters.maxTime) { 
      // Max Time = "Fastest" allowed. (e.g., Show me everything FASTER than 20:00)
      query += ` AND rr.Time <= ?`; 
      values.push(formatForDb(filters.maxTime)); 
    }

    if (filters.prStatus === 'Lifetime') {
      query += ` HAVING isLifetimePR = 1`;
    } else if (filters.prStatus === 'Season') {
      query += ` HAVING isSeasonPR = 1`;
    }

    query += ` ORDER BY m.Date DESC, r.Name ASC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, values);

    return rows.map(row => ({
      ...row,
      isLifetimePR: !!row.isLifetimePR, // Convert 1/0 to boolean
      isSeasonPR: !!row.isSeasonPR,
      FormattedDistance: `${parseFloat(row.Distance)} ${row.DistanceUnit}`
    }));
  }
/*************************** END OF RESULTS PAGE QUERIES *********************************/

/*************************** RUNNER PROFILE QUERIES *********************************/
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
/*************************** END OF RUNNER PROFILE QUERIES *********************************/

/*************************** SCHEDULE QUERIES *********************************/
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
/*************************** END OF SCHEDULE QUERIES *********************************/

/*************************** SEARCH QUERIES *********************************/
  export async function searchRunners(searchTerm: string) {
    const searchPattern = `%${searchTerm}%`;

    const [rows] = await pool.query<RunnerProfileRow[]>(
      'SELECT `Key`, `Name`, `Grade`, `Gender`, `AvatarURL` FROM Runner WHERE `Name` LIKE ? ORDER BY `Name` ASC LIMIT 50',
      [searchPattern]
    );

    return rows;
  }
/*************************** END OF SEARCH QUERIES *********************************/