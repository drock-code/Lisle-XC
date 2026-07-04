"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Map, Download, Maximize2, MapPin, Search, Route } from 'lucide-react';
import Button from '@/components/Button';
import { CourseMapRow } from '@/lib/queries'; 
import CourseMap from '@/components/CourseMap';
import GenericModal from '@/components/GenericModal';

interface CourseMapsClientProps {
  courses: CourseMapRow[];
}

export default function CourseMapsClient({ courses }: CourseMapsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter(course => 
    course.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.Location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="text-center md:text-left">
          <h1 className="font-heading text-4xl font-extrabold text-lisle-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)] mb-2">
            Course Maps
          </h1>
          <p className="font-body text-light-blue drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Explore the trails and terrain of our most common race locations.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-blue w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-light-blue outline-none transition-all"
          />
        </div>
      </header>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const isLisleCourse = course.Name.toLowerCase().includes('lisle');

            return (
              <div 
                key={course.Id}
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Map Preview Container */}
                <div className="relative aspect-4/3 bg-muted overflow-hidden border-b border-border">
                  <Image
                    src={`/files/maps/${course.FileName}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    alt={`Map of ${course.Name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  
                  {/* Quick Action Overlay */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <a 
                      href={`/files/maps/${course.FileName}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-white/90 backdrop-blur rounded-lg text-lisle-blue hover:bg-white shadow-lg transition-all cursor-pointer"
                      title="View Fullscreen Image"
                    >
                      <Maximize2 size={18} />
                    </a>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 grow flex flex-col">
                  <h2 className="font-heading text-xl font-bold text-lisle-blue mb-1">
                    {course.Name}
                  </h2>
                  <div className="flex items-center text-sm text-light-blue font-medium mb-3">
                    <MapPin size={14} className="mr-1" />
                    {course.Location}
                  </div>
                  <p className="text-gray-600 text-sm mb-6 grow">
                    {course.Description}
                  </p>

                  <div className="flex flex-col gap-2 w-full mt-auto">
                    {/* The Generic Modal implementation */}
                    {isLisleCourse && (
                      <GenericModal
                        title={
                          <div className="flex flex-col gap-1">
                            <span className="text-xl">{course.Name}</span>
                            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                              <MapPin size={14} /> {course.Location}
                            </span>
                          </div>
                        }
                        trigger={
                          <div className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-lisle-blue text-white hover:bg-lisle-blue/90 font-medium transition-colors cursor-pointer">
                            <Route size={16} />
                            Interactive Map
                          </div>
                        }
                        maxWidthClass="max-w-5xl" // Override width for the map
                        bodyClassName="p-0 h-[75vh]" // Remove padding and set map height
                      >
                        <div className="w-full h-full relative">
                          <CourseMap geoJsonPath="/courses/construction/tracks.geojson" />
                        </div>
                      </GenericModal>
                    )}

                    <Button 
                      as="a" 
                      href={`/files/maps/${course.FileName}`} 
                      download 
                      className="w-full justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                    >
                      <Download size={16} />
                      Download PDF/Image
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <Map className="w-12 h-12 text-light-gray mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No maps found matching your search.</p>
        </div>
      )}
    </main>
  );
}