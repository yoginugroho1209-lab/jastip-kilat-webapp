"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';

interface RouteMapProps {
  points: { id: string, sequence: number }[];
}

export default function RouteMap({ points }: RouteMapProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const icons = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    const createIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background-color: ${color}; color: black; border-radius: 50px; padding: 4px 8px; border: 2px solid white; font-weight: bold; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.5); font-size: 0.8rem; white-space: nowrap; transform: translate(-50%, -50%);">${label}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
    };

    return {
      resto: createIcon('#ff5f56', '🏪 Gacoan'),
      point: (seq: number) => createIcon('#ffbd2e', `T${seq}`)
    };
  }, []);

  if (!mounted || !icons) return <div style={{ height: '300px', background: '#222', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>;

  const restoCoord: [number, number] = [-7.051, 110.414];
  
  // Dummy coordinates around Tembalang
  const pointCoords: Record<number, [number, number]> = {
    1: [-7.053, 110.418],
    2: [-7.058, 110.422],
    3: [-7.063, 110.428]
  };

  // Only include coordinates for active points
  const activeWaypoints: [number, number][] = [restoCoord];
  
  // Sort points by sequence to ensure the line is drawn correctly
  const sortedPoints = [...points].sort((a, b) => a.sequence - b.sequence);
  
  sortedPoints.forEach(p => {
    if (pointCoords[p.sequence]) {
      activeWaypoints.push(pointCoords[p.sequence]);
    }
  });

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '16px', overflow: 'hidden', zIndex: 0, border: '1px solid var(--glass-border)' }}>
      <MapContainer center={[-7.055, 110.420]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        {/* Dark Mode Map Layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {/* Resto Marker */}
        <Marker position={restoCoord} icon={icons.resto}>
          <Popup>Mie Gacoan Setiabudi</Popup>
        </Marker>
        
        {/* Customer Markers */}
        {sortedPoints.map(p => {
          if (!pointCoords[p.sequence]) return null;
          return (
            <Marker key={p.id} position={pointCoords[p.sequence]} icon={icons.point(p.sequence)}>
              <Popup>Titik {p.sequence}: {p.id}</Popup>
            </Marker>
          );
        })}

        {/* Route Line */}
        {activeWaypoints.length > 1 && (
          <Polyline positions={activeWaypoints} color="#4ade80" weight={4} dashArray="10, 10" />
        )}
      </MapContainer>
    </div>
  );
}
