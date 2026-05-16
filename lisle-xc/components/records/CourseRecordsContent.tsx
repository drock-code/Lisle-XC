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

// State meet courses will ALWAYS be shown and have a unique badge
const STATE_COURSES = [' Detweiller Park, Peoria', ' Maxwell Park, Normal']; 

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

  // Filter the courses based on your new rules
  const visibleCourses = allCourses.filter(course => {
    const isStateCourse = STATE_COURSES.includes(course.courseName);

    // First, ensure the course has at least ONE record for this level.
    const hasAnyRecordForLevel = displayGrades.some(
      grade => course.grades[grade]?.M || course.grades[grade]?.F
    );

    if (!hasAnyRecordForLevel) return false;

    // Check if it has a record at EVERY grade and gender level for the active tab.
    const hasEveryGrade = displayGrades.every(
      grade => course.grades[grade]?.M && course.grades[grade]?.F
    );

    // Keep it if it has every grade, OR if it's a State course
    return hasEveryGrade || isStateCourse;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Course Records by Grade
        </h2>
        
        <div className="w-full sm:w-auto shrink-0">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                {/* Badge to indicate it's a State course */}
                {STATE_COURSES.includes(course.courseName) && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-background text-foreground border border-border px-2 py-1 rounded-md">
                    State Course
                  </span>
                )}
              </div>

              {/* Card Body (Mini Table) */}
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left border-b border-border">
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
                              <div className="flex flex-col space-y-0.5">
                                <span className="font-bold text-foreground">
                                  {formatRaceTime(gradeData.M.Time)}
                                </span>
                                <Link 
                                  href={`/runners/${gradeData.M.RunnerKey}-${generateSlug(gradeData.M.RunnerName)}`}
                                  className="text-sm font-medium text-foreground hover:text-light-blue hover:underline transition-colors truncate max-w-35"
                                >
                                  {gradeData.M.RunnerName}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(gradeData.M.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            ) : <span className="text-muted-foreground/40">-</span>}
                          </td>

                          {/* Girls Column */}
                          <td className="px-4 py-3 border-l border-border">
                            {gradeData?.F ? (
                              <div className="flex flex-col space-y-0.5">
                                <span className="font-bold text-foreground">
                                  {formatRaceTime(gradeData.F.Time)}
                                </span>
                                <Link 
                                  href={`/runners/${gradeData.F.RunnerKey}-${generateSlug(gradeData.F.RunnerName)}`}
                                  className="text-sm font-medium text-foreground hover:text-light-blue hover:underline transition-colors truncate max-w-35"
                                >
                                  {gradeData.F.RunnerName}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(gradeData.F.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
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