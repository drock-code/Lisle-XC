import CourseMap from '@/components/CourseMap';

export default function CoursePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Lisle Community Park Course Map</h1>
      <CourseMap geoJsonPath="/courses/construction/tracks.geojson" />
    </div>
  );
}