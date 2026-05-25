import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '@/lib/db';

interface AdminQueryResult extends RowDataPacket {
  Admin: number;
}

export interface RouteRow extends RowDataPacket {
  RouteKey: number;
  Name: string;
  Distance: number;
  DistanceUnit: string;
}

export interface RunnerRow extends RowDataPacket {
  Key: number;
  Name: string;
  Grade: number | null;
  GraduationYear: number | null;
}

export interface MeetRaceRow extends RowDataPacket {
  RaceKey: number;
}

export interface RunnerResultPayload {
  runnerKey: number;
  time: string;
  grade?: string | number | null;
}

export interface NewMeetData {
  MeetKey: number;
  Meet: string;
  Date: string;
  Season: number;
}

export interface NewRouteData {
  RouteKey: number;
  Name: string;
  Distance: number;
  DistanceUnit: string;
}

export interface MeetRow extends RowDataPacket {
  MeetKey: number;
  Meet: string; 
  Date: Date;
  Season: number;
}

/*************************** ADMIN LOGIN QUERIES *********************************/
  export async function isAdminAndLinkAccount(email: string | null | undefined, googleId: string): Promise<boolean> {
    if (!email) return false;

    try {
      const selectQuery = "SELECT Admin, GoogleID FROM Runner WHERE Email = ? LIMIT 1";
      const [rows] = await pool.execute<AdminQueryResult[]>(selectQuery, [email]);

      if (rows.length === 0 || rows[0].Admin !== 1) {
        return false;
      }

      // If we found the admin but the GoogleID isn't stored yet, save it!
      if (!rows[0].GoogleID) {
        const updateQuery = "UPDATE Runner SET GoogleID = ? WHERE Email = ?";
        await pool.execute<ResultSetHeader>(updateQuery, [googleId, email]);
      }

      return true;
    } catch (error) {
      console.error("Database error in auth check:", error);
      return false;
    }
  }
/*************************** END OF ADMIN LOGIN QUERIES *********************************/


/*************************** ADMIN ROSTER QUERIES *********************************/
  export async function createRunner(data: { 
    name: string; 
    email: string; 
    gender: string; 
    grade: number; 
    graduationYear: number;
  }) {
    const runnerQuery = `
      INSERT INTO Runner (Name, Email, Gender, Grade, GraduationYear, Admin) 
      VALUES (?, ?, ?, ?, ?, 0)
    `;
    
    const [runnerResult] = await pool.execute<ResultSetHeader>(runnerQuery, [
      data.name, 
      data.email, 
      data.gender, 
      data.grade,
      data.graduationYear
    ]);

    const newRunnerId = runnerResult.insertId;

    const seasonYear = data.graduationYear - 13 + data.grade;
    
    const level = data.grade <= 8 ? 'JH' : 'HS';

    const rosterQuery = `
      INSERT INTO TeamRoster (RunnerKey, SeasonYear, Level, Grade)
      VALUES (?, ?, ?, ?)
    `;

    await pool.execute(rosterQuery, [
      newRunnerId,
      seasonYear,
      level,
      data.grade
    ]);

    // Return the new ID so the frontend can use it to upload the avatar
    return newRunnerId;
  }

  export async function updateRunnerAvatar(id: number, url: string) {
    const query = "UPDATE Runner SET AvatarURL = ? WHERE `Key` = ?";
    await pool.execute<ResultSetHeader>(query, [url, id]);
  }

  export async function toggleAdminStatus(runnerId: number, isAdmin: boolean) {
    await pool.execute(
      "UPDATE Runner SET Admin = ? WHERE `Key` = ?",
      [isAdmin ? 1 : 0, runnerId]
    );
  }

  export async function getAllRunners() {
    const query = `
      SELECT \`Key\`, Name, Email, Gender, Grade, GraduationYear, AvatarURL 
      FROM Runner 
      ORDER BY Name ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    return rows;
  }

  export async function getRunnerRosterHistory(runnerId: number) {
    // Get all grades they are currently listed in the roster for
    const rosterQuery = "SELECT Grade, SeasonYear FROM TeamRoster WHERE RunnerKey = ?";
    const [rosterRows] = await pool.execute<RowDataPacket[]>(rosterQuery, [runnerId]);
    
    // Find which years they physically have a race result
    const resultsQuery = "SELECT DISTINCT YEAR(Date) as SeasonYear FROM RunnerResult WHERE RunnerID = ?";
    const [resultRows] = await pool.execute<RowDataPacket[]>(resultsQuery, [runnerId]);
    
    const activeGrades = rosterRows.map(r => r.Grade);
    const yearsWithResults = resultRows.map(r => r.SeasonYear);
    
    // Cross-reference: If they have a result in that SeasonYear, lock the corresponding Grade
    const lockedGrades = rosterRows
      .filter(r => yearsWithResults.includes(r.SeasonYear))
      .map(r => r.Grade);
      
    return { activeGrades, lockedGrades };
  }

  export async function updateRunner(id: number, data: { 
    name: string; 
    email: string | null; 
    gender: string; 
    grade: number; 
    graduationYear: number;
  }) {
    
    const updateRunnerQuery = `
      UPDATE Runner 
      SET Name = ?, Email = ?, Gender = ?, Grade = ?, GraduationYear = ?
      WHERE \`Key\` = ?
    `;
    await pool.execute<ResultSetHeader>(updateRunnerQuery, [
      data.name, 
      data.email, 
      data.gender, 
      data.grade, 
      data.graduationYear, 
      id
    ]);

    // Recalculate SeasonYear for ALL past roster entries if GraduationYear changed.
    // Formula: SeasonYear = GraduationYear - 13 + Grade
    const updateRosterQuery = `
      UPDATE TeamRoster 
      SET SeasonYear = ? - 13 + Grade 
      WHERE RunnerKey = ?
    `;
    await pool.execute<ResultSetHeader>(updateRosterQuery, [data.graduationYear, id]);
  }

  // Safely handle the Grade Checkboxes on the Edit form
  export async function updateRunnerRoster(runnerId: number, selectedGrades: number[], graduationYear: number) {
    const { lockedGrades } = await getRunnerRosterHistory(runnerId);
    
    // Backend Safety Net: Ensure locked grades are kept even if unchecked on frontend
    const finalGradesToKeep = new Set([...selectedGrades, ...lockedGrades]);
    
    const rosterQuery = "SELECT Grade FROM TeamRoster WHERE RunnerKey = ?";
    const [currentRows] = await pool.execute<RowDataPacket[]>(rosterQuery, [runnerId]);
    const currentGrades = currentRows.map(r => r.Grade);
    
    const gradesToAdd = Array.from(finalGradesToKeep).filter(g => !currentGrades.includes(g));
    const gradesToRemove = currentGrades.filter(g => !finalGradesToKeep.has(g));
    
    // Insert newly checked grades
    if (gradesToAdd.length > 0) {
      const insertQuery = "INSERT INTO TeamRoster (RunnerKey, SeasonYear, Level, Grade) VALUES (?, ?, ?, ?)";
      for (const grade of gradesToAdd) {
        const seasonYear = graduationYear - 13 + grade;
        const level = grade <= 8 ? 'JH' : 'HS';
        await pool.execute(insertQuery, [runnerId, seasonYear, level, grade]);
      }
    }
    
    // Delete newly unchecked grades
    if (gradesToRemove.length > 0) {
      const placeholders = gradesToRemove.map(() => '?').join(',');
      const deleteQuery = `DELETE FROM TeamRoster WHERE RunnerKey = ? AND Grade IN (${placeholders})`;
      await pool.execute(deleteQuery, [runnerId, ...gradesToRemove]);
    }
  }

  // Fetch a specific year's roster (Powers the "Manage Roster" tab)
  export async function getSeasonRoster(seasonYear: number) {
    const query = `
      SELECT r.\`Key\`, r.Name, r.Gender, r.Grade as CurrentGrade, tr.Grade as RosterGrade, tr.Level
      FROM Runner r
      JOIN TeamRoster tr ON r.\`Key\` = tr.RunnerKey
      WHERE tr.SeasonYear = ?
      ORDER BY r.Name ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [seasonYear]);
    return rows;
  }

  export async function deleteRunner(runnerId: number) {
    // Safety Check: Ensure they have no race results
    const resultCheckQuery = "SELECT COUNT(*) as count FROM RunnerResult WHERE RunnerID = ?";
    const [rows] = await pool.execute<RowDataPacket[]>(resultCheckQuery, [runnerId]);
    
    if (rows[0].count > 0) {
      throw new Error("Cannot delete runner with existing race results.");
    }

    const deleteRosterQuery = "DELETE FROM TeamRoster WHERE RunnerKey = ?";
    await pool.execute(deleteRosterQuery, [runnerId]);

    const deleteRunnerQuery = "DELETE FROM Runner WHERE `Key` = ?";
    await pool.execute(deleteRunnerQuery, [runnerId]);
  }

  export async function getAwardsDataForYear(requestedYear: number | null) {
  const [yearsResult] = await pool.execute(`
    SELECT DISTINCT SeasonYear 
    FROM TeamRoster 
    ORDER BY SeasonYear DESC
  `);
  const availableYears = (yearsResult as { SeasonYear: number }[]).map(row => row.SeasonYear);
  const activeYear = requestedYear ?? availableYears[0] ?? new Date().getFullYear();

  const [roster] = await pool.execute(`
    SELECT r.\`Key\`, r.Name, tr.Level 
    FROM TeamRoster tr
    JOIN Runner r ON tr.RunnerKey = r.\`Key\`
    WHERE tr.SeasonYear = ?
    ORDER BY r.Name ASC
  `, [activeYear]);

  // Get autocomplete suggestions
  const [awardSuggestions] = await pool.execute(`
    SELECT DISTINCT Award FROM RunnerAward WHERE Award IS NOT NULL AND Award != ''
    UNION 
    SELECT DISTINCT Award FROM TeamAward WHERE Award IS NOT NULL AND Award != ''
    ORDER BY Award ASC
  `);

  const [captains] = await pool.execute(`
    SELECT \`Key\`, Name, RunnerKey 
    FROM Captain 
    WHERE Year = ?
  `, [activeYear]);

  const [runnerAwards] = await pool.execute(`
    SELECT \`Key\`, Name, Award, IsJH, RunnerKey 
    FROM RunnerAward 
    WHERE Year = ?
  `, [activeYear]);

  const [teamAwards] = await pool.execute(`
    SELECT ID, TeamName, Award 
    FROM TeamAward 
    WHERE Year = ?
  `, [activeYear]);

  return { availableYears, activeYear, roster, awardSuggestions, captains, runnerAwards, teamAwards };
}

  // --- CAPTAIN QUERIES ---
  export async function insertCaptain(year: number, runnerKey: number, name: string) {
    const [result] = await pool.execute(
      'INSERT INTO Captain (Year, RunnerKey, Name) VALUES (?, ?, ?)',
      [year, runnerKey, name]
    );
    return result;
  }

  export async function deleteCaptain(id: number) {
    const [result] = await pool.execute('DELETE FROM Captain WHERE `Key` = ?', [id]);
    return result;
  }

  // --- RUNNER AWARD QUERIES ---
  export async function insertRunnerAward(year: number, runnerKey: number, name: string, award: string, isJH: boolean) {
    const [result] = await pool.execute(
      'INSERT INTO RunnerAward (Year, RunnerKey, Name, Award, IsJH) VALUES (?, ?, ?, ?, ?)',
      [year, runnerKey, name, award, isJH ? 1 : 0]
    );
    return result;
  }

  export async function deleteRunnerAward(id: number) {
    const [result] = await pool.execute('DELETE FROM RunnerAward WHERE `Key` = ?', [id]);
    return result;
  }

  // --- TEAM AWARD QUERIES ---
  export async function insertTeamAward(year: number, teamName: string, award: string) {
    const [result] = await pool.execute(
      'INSERT INTO TeamAward (Year, TeamName, Award) VALUES (?, ?, ?)',
      [year, teamName, award]
    );
    return result;
  }

  export async function deleteTeamAward(id: number) {
    const [result] = await pool.execute('DELETE FROM TeamAward WHERE ID = ?', [id]);
    return result;
  }
/*************************** END OF ADMIN ROSTER QUERIES *********************************/

/*************************** ADMIN SCHEDULE QUERIES *********************************/
  export async function getScheduleForYear(requestedYear: number | null) {
    // Grab all unique years from the Dates in the schedule
    const [yearsResult] = await pool.execute(`
      SELECT DISTINCT YEAR(Date) as SeasonYear 
      FROM Schedule 
      WHERE Date IS NOT NULL
      ORDER BY SeasonYear DESC
    `);
    
    const availableYears = (yearsResult as { SeasonYear: number }[]).map(row => row.SeasonYear);

    // Determine active year (Fallback to newest year or current year)
    const activeYear = requestedYear ?? availableYears[0] ?? new Date().getFullYear();

    // Fetch the meets for that specific year
    const [meets] = await pool.execute(`
      SELECT ID, Meet, Date, Time, Location, Level, Info 
      FROM Schedule 
      WHERE YEAR(Date) = ?
      ORDER BY Date ASC, Time ASC
    `, [activeYear]);

    return { availableYears, activeYear, meets };
  }

  export async function insertMeetToSchedule(
    meet: string, 
    date: string, 
    time: string | null, 
    location: string | null, 
    level: string | null, 
    info: string | null
  ) {
    const [result] = await pool.execute(
      `INSERT INTO Schedule (Meet, Date, Time, Location, Level, Info) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [meet, date, time, location, level, info]
    );
    return result;
  }

  export async function updateMeet(
    id: number,
    meet: string, 
    date: string, 
    time: string | null, 
    location: string | null, 
    level: string | null, 
    info: string | null
  ) {
    const [result] = await pool.execute(
      `UPDATE Schedule 
       SET Meet = ?, Date = ?, Time = ?, Location = ?, Level = ?, Info = ? 
       WHERE ID = ?`,
      [meet, date, time, location, level, info, id]
    );
    return result;
  }

  export async function deleteMeet(id: number) {
    const [result] = await pool.execute(
      `DELETE FROM Schedule WHERE ID = ?`,
      [id]
    );
    return result;
  }

  export async function getRaceFiles(raceId: number) {
    const [results] = await pool.execute(
      `SELECT ID, RaceID, Title, File, CreatedAt, UpdatedAt 
      FROM RaceFile 
      WHERE RaceID = ?
      ORDER BY CreatedAt ASC`,
      [raceId]
    );
    return results;
  }

  export async function insertRaceFile(raceId: number, title: string, fileUrl: string) {
    const [result] = await pool.execute(
      `INSERT INTO RaceFile (RaceID, Title, File) VALUES (?, ?, ?)`,
      [raceId, title, fileUrl]
    );
    return result;
  }

  export async function deleteRaceFile(id: number) {
    const [result] = await pool.execute(
      `DELETE FROM RaceFile WHERE ID = ?`,
      [id]
    );
    return result;
  }

  export async function updateRaceFileTitle(id: number, title: string) {
    const [result] = await pool.execute(
      `UPDATE RaceFile SET Title = ? WHERE ID = ?`,
      [title, id]
    );
    return result;
  }
/*************************** END OF ADMIN SCHEDULE QUERIES *********************************/

/*************************** ADMIN RESULT QUERIES *********************************/
  export async function getRoutes(): Promise<RouteRow[]> {
    const [rows] = await pool.query<RouteRow[]>(
      'SELECT RouteKey, Name, Distance, DistanceUnit FROM Route ORDER BY Name ASC'
    );
    return rows;
  }

  export async function saveMeetResults(
    meetKey: number, 
    routeKey: number, 
    isJh: number, 
    results: RunnerResultPayload[],
    date: string
  ): Promise<{ success: boolean; raceKey: number }> {
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Find or create the MeetRace link
      const [existingRace] = await connection.query<MeetRaceRow[]>(
        'SELECT RaceKey FROM MeetRace WHERE MeetID = ? AND RouteKey = ? AND JH = ?',
        [meetKey, routeKey, isJh]
      );

      let raceKey: number;

      if (existingRace.length > 0) {
        raceKey = existingRace[0].RaceKey;
      } else {
        const [newRace] = await connection.query<ResultSetHeader>(
          'INSERT INTO MeetRace (MeetID, RouteKey, JH) VALUES (?, ?, ?)',
          [meetKey, routeKey, isJh]
        );
        raceKey = newRace.insertId;
      }

      // Insert the results
      for (const res of results) {
        if (!res.runnerKey || !res.time) continue; // Skip incomplete rows
        
        let formattedTime = res.time.trim();
        
        // Count how many colons are in the string. 
        // If there's only 1 (e.g., "21:47" or "21:47.55"), it's MM:SS.
        // We prepend "00:" to force MySQL to read it as HH:MM:SS.
        if (formattedTime.split(':').length === 2) {
          formattedTime = `00:${formattedTime}`;
        }

        // Upsert: Insert new row, or update existing if RaceID + RunnerID matches
        await connection.query<ResultSetHeader>(
          `INSERT INTO RunnerResult (RaceID, RunnerID, Grade, Time, JH, Date) 
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            Time = VALUES(Time), 
            Grade = VALUES(Grade),
            JH = VALUES(JH),
            Date = VALUES(Date)`,
          [raceKey, res.runnerKey, res.grade || null, formattedTime, isJh, date] 
        );
      }
      
      await connection.commit();
      return { success: true, raceKey };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  export async function insertMeet(name: string, date: string, season: number): Promise<NewMeetData> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Meet (Name, Date, Season) VALUES (?, ?, ?)',
      [name, date, season]
    );

    return {
      MeetKey: result.insertId,
      Meet: name,
      Date: date,
      Season: season
    };
  }

  // Insert a new route and return the newly created row data
  export async function insertRoute(name: string, distance: number, distanceUnit: string): Promise<NewRouteData> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Route (Name, Distance, DistanceUnit) VALUES (?, ?, ?)',
      [name, distance, distanceUnit]
    );

    return {
      RouteKey: result.insertId,
      Name: name,
      Distance: distance,
      DistanceUnit: distanceUnit
    };
  }

  export async function getMeets(year?: number): Promise<MeetRow[]> {
    let query: string;
    let queryParams: number[] = [];

    if (year) {
      query = 'SELECT MeetKey, Name AS Meet, Date, Season FROM Meet WHERE Season = ? ORDER BY Date ASC';
      queryParams = [year];
    } else {
      query = 'SELECT MeetKey, Name AS Meet, Date, Season FROM Meet ORDER BY Date ASC';
    }

    const [rows] = await pool.query<MeetRow[]>(query, queryParams);
    return rows;
  }

  export async function getExistingMeetResults(meetKey: number) {
    const [results] = await pool.query<RowDataPacket[]>(`
      SELECT rr.RunnerID, rr.Time, mr.RaceKey
      FROM RunnerResult rr
      JOIN MeetRace mr ON rr.RaceID = mr.RaceKey
      WHERE mr.MeetID = ?
    `, [meetKey]);

    return results; // Returns an array like: [{ RunnerID: 5, Time: '18:30:00', Place: 1, RaceKey: 12 }]
  }
/*************************** END OF ADMIN RESULT QUERIES *********************************/