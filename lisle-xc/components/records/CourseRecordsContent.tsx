"use client";

import { useState } from 'react';
import Link from 'next/link';
import { generateSlug, formatRaceTime } from '@/lib/utils';
import { CourseRecordRow } from '@/lib/queries';
import { TabGroup, Tab } from '@/components/Tabs'; 

interface CourseRecordsContentProps {
  records: CourseRecordRow[];
}

type GradeRecord = { M?: CourseRecordRow; F?: CourseRecordRow };
type GroupedCourse = {
  courseName: string;
  distanceInfo: string;
  grades: Record<number, GradeRecord>;
};

// Define your state meet course names exactly as they appear in the database
const STATE_COURSES = ['Detweiller Park, Peoria', ' Maxwell Park, Normal']; 

export default function CourseRecordsContent({ records }: CourseRecordsContentProps) {
  const [activeLevel, setActiveLevel] = useState<'HS' | 'JH'>('HS');
  
  const groupedRecords = records.reduce((acc: Record<string, GroupedCourse>, row) => {
    if (!acc[row.CourseName]) {
      acc[row.CourseName] = {
        courseName: row.CourseName,
        distanceInfo: row.Distance ? `${Number(row.Distance)} ${row.DistanceUnit || 'Miles'}` : 'Unknown Distance',
        grades: {},
      };
    }
    
    if (!acc[row.CourseName].grades[row.Grade]) {
      acc[row.CourseName].grades[row.Grade] = {};
    }
    
    acc[row.CourseName].grades[row.Grade][row.Gender as 'M' | 'F'] = row;
    
    return acc;
  }, {});

  const allCourses = Object.values(groupedRecords);

  const displayGrades = activeLevel === 'HS' 
    ? [12, 11, 10, 9] 
    : [8, 7, 6];

  const gradeLabels: Record<number, string> = {
    12: 'Senior', 11: 'Junior', 10: 'Sophomore', 9: 'Freshman', 
    8: '8th Grade', 7: '7th Grade', 6: '6th Grade'
  };

  // 2. Filter the courses based on your new rules
  const visibleCourses = allCourses.filter(course => {
    // Check if the course is one of the designated State meets
    const isStateCourse = STATE_COURSES.includes(course.courseName);

    // First, ensure the course has at least ONE record for this level.
    // (This prevents the HS State meet from showing up on the JH tab as an empty card).
    const hasAnyRecordForLevel = displayGrades.some(
      grade => course.grades[grade]?.M || course.grades[grade]?.F
    );

    if (!hasAnyRecordForLevel) return false;

    // Check if it has a record at EVERY grade level for the active tab.
    // (If you want to be super strict and require BOTH Boys and Girls at every level, 
    // change the "||" to an "&&" below).
    const hasEveryGrade = displayGrades.every(
      grade => course.grades[grade]?.M || course.grades[grade]?.F
    );

    // Keep it if it has every grade, OR if it's a State course
    return hasEveryGrade || isStateCourse;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Course Records by Grade</h2>
        
        <div className="w-full sm:w-auto">
          <TabGroup>
            <Tab 
              label="High School" 
              isActive={activeLevel === 'HS'} 
              onClick={() => setActiveLevel('HS')} 
            />
            <Tab 
              label="Junior High" 
              isActive={activeLevel === 'JH'} 
              onClick={() => setActiveLevel('JH')} 
            />
          </TabGroup>
        </div>
      </div>

      {/* Grid of Cards */}
      {visibleCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleCourses.map((course) => (
            <div 
              key={course.courseName} 
              className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-light-blue-gray/10 p-4 border-b border-border flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{course.courseName}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{course.distanceInfo}</p>
                </div>
                {/* Optional: Add a little badge to indicate it's a State course */}
                {STATE_COURSES.includes(course.courseName) && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-lisle-blue/10 text-lisle-blue px-2 py-1 rounded-md">
                    State Meet
                  </span>
                )}
              </div>

              {/* Card Body (Mini Table) */}
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-background text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                    <tr>
                      <th className="px-4 py-3 w-1/4">Grade</th>
                      <th className="px-4 py-3 w-3/8 border-l border-border">Boys Record</th>
                      <th className="px-4 py-3 w-3/8 border-l border-border">Girls Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayGrades.map((grade) => {
                      const gradeData = course.grades[grade];
                      if (!gradeData?.M && !gradeData?.F) return null;

                      return (
                        <tr key={grade} className="hover:bg-light-blue-gray/5 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                            {gradeLabels[grade]}
                          </td>
                          
                          {/* Boys Column */}
                          <td className="px-4 py-3 border-l border-border">
                            {gradeData?.M ? (
                              <Link 
                                href={`/runners/${gradeData.M.RunnerKey}-${generateSlug(gradeData.M.RunnerName)}`}
                                className="group block"
                              >
                                <div className="font-bold text-lisle-blue group-hover:text-light-blue transition-colors">
                                  {formatRaceTime(gradeData.M.Time)}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                  {gradeData.M.RunnerName}
                                </div>
                              </Link>
                            ) : <span className="text-muted-foreground/40">-</span>}
                          </td>

                          {/* Girls Column */}
                          <td className="px-4 py-3 border-l border-border">
                            {gradeData?.F ? (
                              <Link 
                                href={`/runners/${gradeData.F.RunnerKey}-${generateSlug(gradeData.F.RunnerName)}`}
                                className="group block"
                              >
                                <div className="font-bold text-lisle-blue group-hover:text-light-blue transition-colors">
                                  {formatRaceTime(gradeData.F.Time)}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                  {gradeData.F.RunnerName}
                                </div>
                              </Link>
                            ) : <span className="text-muted-foreground/40">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-background rounded-2xl border border-border shadow-sm">
          <p className="text-muted-foreground font-medium">
            No complete course records found for {activeLevel === 'HS' ? 'High School' : 'Junior High'} grades.
          </p>
        </div>
      )}
    </div>
  );
}