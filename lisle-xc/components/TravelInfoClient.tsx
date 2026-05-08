"use client";

import { useState } from 'react';
import { Search, MapPin, Car, Coffee, Map, Navigation, Trophy, Clock } from 'lucide-react';
import Button from '@/components/Button';
import RichTextContent from '@/components/RichTextContent';
import { TravelInfoRow } from '@/lib/queries';

interface TravelInfoClientProps {
  travelInfoData: TravelInfoRow[];
}

export default function TravelInfoClient({ travelInfoData }: TravelInfoClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = travelInfoData.filter(info => 
    info.MeetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    info.LocationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="text-center md:text-left">
          <h1 className="font-heading text-4xl font-extrabold text-light-blue tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.6)] mb-2">
            Meet Travel Info
          </h1>
          <p className="font-body text-light-blue drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Logistics, parking, and return times for our away meets.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search meets or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-light-blue outline-none transition-all"
          />
        </div>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLocations.map((info) => (
          <div 
            key={info.Id} 
            className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            {/* Card Header */}
            <div className="border-b border-border p-5">
              <div className="flex justify-between items-start mb-1">
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {info.MeetName}
                </h2>
              </div>
              <h3 className="text-foreground font-semibold text-lg flex items-center gap-2 mb-2">
                {info.LocationName}
              </h3>
              {info.GmapsLink && (
                <a 
                  href={info.GmapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-foreground hover:text-light-blue hover:underline transition-colors font-bold"
                >
                  <MapPin size={16} className="mr-1.5 shrink-0" />
                  {info.Address}
                </a>
              )}
            </div>

            {/* Card Body */}
            <div className="p-5 grow space-y-8">
              
              {/* Estimated Return Time */}
              {info.ReturnTime && (
                <div className="flex gap-4">
                  <div className="bg-light-blue/10 p-2.5 rounded-xl h-fit">
                    <Clock className="w-5 h-5 text-light-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground mb-1 uppercase tracking-wider text-xs opacity-70">
                      Estimated Return Time
                    </h4>
                    <RichTextContent content={info.ReturnTime} />
                  </div>
                </div>
              )}

              {/* Parking Info */}
              {info.Parking && (
                <div className="flex gap-4">
                  <div className="bg-light-blue/10 p-2.5 rounded-xl h-fit">
                    <Car className="w-5 h-5 text-light-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground mb-1 uppercase tracking-wider text-xs opacity-70">
                      Parking & Arrival
                    </h4>
                    <RichTextContent content={info.Parking} />
                  </div>
                </div>
              )}

              {/* Concessions Info */}
              {info.Concessions && (
                <div className="flex gap-4">
                  <div className="bg-light-blue/10 p-2.5 rounded-xl h-fit">
                    <Coffee className="w-5 h-5 text-light-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground mb-1 uppercase tracking-wider text-xs opacity-70">
                      Facilities & Concessions
                    </h4>
                    <RichTextContent content={info.Concessions} />
                  </div>
                </div>
              )}

              {/* Awards Info */}
              {info.Awards && (
                <div className="flex gap-4">
                  <div className="bg-light-blue/10 p-2.5 rounded-xl h-fit">
                    <Trophy className="w-5 h-5 text-light-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground mb-1 uppercase tracking-wider text-xs opacity-70">
                      Awards
                    </h4>
                    <RichTextContent content={info.Awards} />
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="p-5 border-t border-border bg-background/50 flex flex-col sm:flex-row gap-3">
              {info.GmapsLink && (
                <Button 
                  as="a" 
                  href={info.GmapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 w-full gap-2 justify-center"
                >
                  <Navigation size={16} />
                  Get Directions
                </Button>
              )}
              
              {info.CourseMapFileName && (
                <Button 
                  as="a" 
                  href={`/files/maps/${info.CourseMapFileName}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  isActive={true} 
                  className="flex-1 w-full gap-2 justify-center"
                >
                  <Map size={16} />
                  View Course Map
                </Button>
              )}
            </div>
          </div>
        ))}

        {filteredLocations.length === 0 && (
          <div className="col-span-full text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <MapPin className="w-12 h-12 text-light-gray mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No travel info found for that search.</p>
          </div>
        )}
      </div>
    </main>
  );
}