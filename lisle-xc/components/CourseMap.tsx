"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import type { FeatureCollection, LineString, Feature } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize the token directly on the mapboxgl object
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface CourseMapProps {
  geoJsonPath: string;
}

// An array of Tailwind-inspired hex colors for the route segments.
const MILE_COLORS = [
  '#0284c7', // Sky 600 (Mile 1)
  '#ea580c', // Orange 600 (Mile 2)
  '#16a34a', // Green 600 (Mile 3)
];

export default function CourseMap({ geoJsonPath }: CourseMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true); // NEW: Track WebGL support

  useEffect(() => {
    // Check if Mapbox / WebGL is supported by the client browser
    if (!mapboxgl.supported()) {
      // Defer the state update to the next tick to avoid React's synchronous setState warning
      setTimeout(() => {
        setIsSupported(false);
      }, 0);
      return;
    }

    // Prevent the map from initializing more than once
    if (map.current || !mapContainer.current) return;

    try {
      // Initialize the map inside a try/catch to prevent fatal crashes
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-88.08, 41.81], // Default fallback
        zoom: 14,
      });
    } catch (error) {
      console.error('WebGL initialization error:', error);
      setTimeout(() => {
        setIsSupported(false);
      }, 0);
      return;
    }

    // Wait for the map to load its base styles before adding the route
    map.current.on('load', () => {
      fetch(geoJsonPath)
        .then((res) => res.json())
        .then((data: FeatureCollection) => {
          if (!map.current) return;

          const firstFeature = data.features?.[0];
          if (!firstFeature || firstFeature.geometry.type !== 'LineString') return;

          const routeLine = firstFeature as Feature<LineString>;
          const totalDistance = turf.length(routeLine, { units: 'miles' });
          
          // --- ROUTE COLOR SLICING ---
          const segments: Feature<LineString>[] = [];
          const numSegments = Math.ceil(totalDistance);
          
          for (let i = 0; i < numSegments; i++) {
            const startMile = i;
            const endMile = Math.min(i + 1, totalDistance);
            
            const segment = turf.lineSliceAlong(routeLine, startMile, endMile, { units: 'miles' });
            segment.properties = { segmentId: i };
            segments.push(segment);
          }

          map.current.addSource('course-route', {
            type: 'geojson',
            data: turf.featureCollection(segments),
          });

          map.current.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'course-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': [
                'match',
                ['get', 'segmentId'],
                0, MILE_COLORS[0],
                1, MILE_COLORS[1],
                2, MILE_COLORS[2],
                3, MILE_COLORS[3],
                /* fallback color */ '#0284c7' 
              ],
              'line-width': 4,
              'line-opacity': 0.85,
            },
          });

          // --- UI MARKERS ---
          const coordinates = routeLine.geometry.coordinates as [number, number][];

          if (coordinates.length > 0) {
            const startCoord = coordinates[0];
            const finishCoord = coordinates[coordinates.length - 1];

            // Dynamically center the camera on the start of the route
            map.current.flyTo({ center: startCoord, zoom: 15 });

            // START MARKER
            const startEl = document.createElement('div');
            startEl.className = 'w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold cursor-pointer';
            startEl.innerText = 'S';
            new mapboxgl.Marker(startEl)
              .setLngLat(startCoord)
              .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML('<p class="font-bold text-gray-900 m-0">Start Line</p>'))
              .addTo(map.current);

            // FINISH MARKER
            const finishEl = document.createElement('div');
            finishEl.className = 'w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold cursor-pointer';
            finishEl.innerText = 'F';
            new mapboxgl.Marker(finishEl)
              .setLngLat(finishCoord)
              .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML('<p class="font-bold text-gray-900 m-0">Finish Line</p>'))
              .addTo(map.current);
            
            // AUTOMATED MILE MARKERS
            for (let i = 1; i <= Math.floor(totalDistance); i++) {
              const milePoint = turf.along(routeLine, i, { units: 'miles' });
              const mileCoord = milePoint.geometry.coordinates as [number, number];

              // Match border color to upcoming segment
              const markerColorClass = i === 1 ? 'border-orange-600 text-orange-600' : i === 2 ? 'border-green-600 text-green-600' : 'border-purple-600 text-purple-600';

              const mileEl = document.createElement('div');
              mileEl.className = `w-5 h-5 bg-white rounded-sm border-2 shadow-sm flex items-center justify-center text-[10px] font-bold cursor-pointer ${markerColorClass}`;
              mileEl.innerText = `${i}`;

              new mapboxgl.Marker(mileEl)
                .setLngLat(mileCoord)
                .setPopup(new mapboxgl.Popup({ offset: 20, closeButton: false }).setHTML(`<p class="font-bold text-gray-900 m-0">Mile ${i}</p>`))
                .addTo(map.current!);
            }
          }

          // --- BUS PARKING MARKER ---
          const busCoord: [number, number] = [-88.0860250806309, 41.79133729096342]; 
          const busEl = document.createElement('div');
          busEl.className = 'w-8 h-8 bg-yellow-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-sm cursor-pointer';
          busEl.innerText = '🚌';

          new mapboxgl.Marker(busEl)
            .setLngLat(busCoord)
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false })
                .setHTML('<p class="font-bold text-gray-900 m-0">Bus Parking</p><p class="text-xs text-gray-600 m-0">1945 Ohio Street</p>')
            )
            .addTo(map.current);

          // --- TEAM TENTS MARKER ---
          const tentCoord: [number, number] = [-88.08321000127937, 41.79293472254785]; 
          const tentEl = document.createElement('div');
          tentEl.className = 'w-8 h-8 bg-pink-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-sm cursor-pointer';
          tentEl.innerText = '⛺';

          new mapboxgl.Marker(tentEl)
            .setLngLat(tentCoord)
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false })
                .setHTML('<p class="font-bold text-gray-900 m-0">Team Tents</p><p class="text-xs text-gray-600 m-0">Front of School</p>')
            )
            .addTo(map.current);

        })
        .catch((err) => console.error("Error loading course map GeoJSON:", err));
    });

    // Clean up the map instance when the component unmounts
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [geoJsonPath]);

  // Display a clean fallback if WebGL fails instead of crashing the page
  if (!isSupported) {
    return (
      <div className="w-full h-100 sm:h-125 flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl shadow-sm">
        <p className="font-bold text-gray-800 text-lg mb-2">
          Interactive Map Unavailable
        </p>
        <p className="text-sm text-gray-500 max-w-md">
          WebGL is either disabled or unsupported on your browser or device. Please enable hardware or graphics acceleration in your browser settings to view the interactive map.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-100 sm:h-125 rounded-2xl overflow-hidden border border-border shadow-sm relative [&_.mapboxgl-popup-content]:p-2 [&_.mapboxgl-popup-content]:rounded-lg" 
    />
  );
}