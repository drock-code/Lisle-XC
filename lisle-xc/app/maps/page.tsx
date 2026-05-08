import { getCourseMaps } from '@/lib/queries';
import CourseMapsClient from '@/components/CourseMapsClient';


export default async function CourseMapsPage() {
  const courses = await getCourseMaps();

  return <CourseMapsClient courses={courses} />;
}