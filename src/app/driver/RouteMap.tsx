"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
  points: { id: string, sequence: number }[];
}

export default function RouteMap({ points }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView([-7.055, 110.420], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO'
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Draw Markers and Route
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    // Clear existing markers and polylines
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    const createIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background-color: ${color}; color: black; border-radius: 50px; padding: 4px 8px; border: 2px solid white; font-weight: bold; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.5); font-size: 0.8rem; white-space: nowrap; transform: translate(-50%, -50%);">${label}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
    };

    const restoCoord: [number, number] = [-7.051, 110.414];
    L.marker(restoCoord, { icon: createIcon('#ff5f56', '🏪 Gacoan') })
      .bindPopup('Mie Gacoan Setiabudi')
      .addTo(map);

    const pointCoords: Record<number, [number, number]> = {
      1: [-7.053, 110.418],
      2: [-7.058, 110.422],
      3: [-7.063, 110.428]
    };

    const activeWaypoints: [number, number][] = [restoCoord];
    const sortedPoints = [...points].sort((a, b) => a.sequence - b.sequence);
    
    sortedPoints.forEach(p => {
      if (pointCoords[p.sequence]) {
        const coord = pointCoords[p.sequence];
        activeWaypoints.push(coord);
        L.marker(coord, { icon: createIcon('#ffbd2e', `T${p.sequence}`) })
          .bindPopup(`Titik ${p.sequence}: ${p.id}`)
          .addTo(map);
      }
    });

    if (activeWaypoints.length > 1) {
      L.polyline(activeWaypoints, { color: '#4ade80', weight: 4, dashArray: '10, 10' }).addTo(map);
    }
  }, [points]);

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
       <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
