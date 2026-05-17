import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '@/lib/db';

interface AdminQueryResult extends RowDataPacket {
  Admin: number;
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
/*************************** END OF ADMIN ROSTER QUERIES *********************************/