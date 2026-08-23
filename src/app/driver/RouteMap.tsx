"use client";

import { useEffect, useState, useMemo } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteMapProps {
  points: { id: string, sequence: number }[];
}

export default function RouteMap({ points }: RouteMapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [routeData, setRouteData] = useState<any>(null);

  // Coordinates data
  const restoCoord = { lat: -7.051, lng: 110.414 };
  const pointCoords: Record<number, {lat: number, lng: number}> = {
    1: { lat: -7.053, lng: 110.418 },
    2: { lat: -7.058, lng: 110.422 },
    3: { lat: -7.063, lng: 110.428 }
  };

  const activeWaypoints = [restoCoord];
  const sortedPoints = [...points].sort((a, b) => a.sequence - b.sequence);
  sortedPoints.forEach(p => {
    if (pointCoords[p.sequence]) activeWaypoints.push(pointCoords[p.sequence]);
  });

  // Fetch real road route using Mapbox Directions API
  useEffect(() => {
    if (!mapboxToken || activeWaypoints.length < 2) return;

    const coordString = activeWaypoints.map(c => `${c.lng},${c.lat}`).join(';');
    fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?geometries=geojson&access_token=${mapboxToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          setRouteData(data.routes[0].geometry);
        }
      })
      .catch(err => console.error("Mapbox Routing Error:", err));
  }, [points, mapboxToken]);

  // If no token is provided yet
  if (!mapboxToken) {
    return (
      <div style={{ height: '300px', width: '100%', borderRadius: '16px', border: '1px solid #ffbd2e', background: 'rgba(255,189,46,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: '#ffbd2e', marginBottom: '1rem' }}>Mapbox Belum Dikonfigurasi</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Masukkan <strong>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</strong> di file <code>.env.local</code> Anda untuk memunculkan Peta 3D Interaktif dari Mapbox.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
      <Map
        initialViewState={{
          longitude: 110.420,
          latitude: -7.055,
          zoom: 14,
          pitch: 45, // Tilt for 3D effect
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
      >
        {/* Resto Marker */}
        <Marker longitude={restoCoord.lng} latitude={restoCoord.lat} anchor="bottom">
          <div style={{ background: '#ff5f56', color: 'white', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
            🏪 Gacoan
          </div>
        </Marker>

        {/* Delivery Points Markers */}
        {sortedPoints.map(p => {
          const coord = pointCoords[p.sequence];
          if (!coord) return null;
          return (
            <Marker key={p.id} longitude={coord.lng} latitude={coord.lat} anchor="bottom">
              <div style={{ background: '#ffbd2e', color: 'black', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
                T{p.sequence}
              </div>
            </Marker>
          );
        })}

        {/* Route Line */}
        {routeData && (
          <Source id="route" type="geojson" data={{ type: 'Feature', properties: {}, geometry: routeData }}>
            <Layer 
              id="route-line"
              type="line"
              paint={{
                'line-color': '#4ade80',
                'line-width': 5,
                'line-opacity': 0.8
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}
