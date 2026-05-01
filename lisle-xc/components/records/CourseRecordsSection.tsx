import { getCourseRecords } from '@/lib/queries';
import CourseRecordsContent from './CourseRecordsContent';

export default async function CourseRecordsSection() {
  const courseRecords = await getCourseRecords();

  return <CourseRecordsContent records={courseRecords} />;
}