import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '@/lib/db';

interface AdminQueryResult extends RowDataPacket {
  Admin: number;
}

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