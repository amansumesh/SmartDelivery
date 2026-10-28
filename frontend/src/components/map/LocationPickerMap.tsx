'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import type * as LeafletType from 'leaflet';
import { Warehouse } from '@/types';
import { Search, Navigation, Compass, Loader2 } from 'lucide-react';

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  destinationName: string;
  warehouses: Warehouse[];
  onLocationSelect: (location: { name: string; latitude: number; longitude: number }) => void;
}

const PRESETS = [
  { name: 'Chennai Central', lat: 13.0827, lng: 80.2707, area: 'Metropolitan Core' },
  { name: 'Tambaram South', lat: 12.9249, lng: 80.1000, area: 'Suburban Hub' },
  { name: 'Sriperumbudur Industrial', lat: 12.9675, lng: 79.9442, area: 'Manufacturing Corridor' },
  { name: 'Kanchipuram Depot', lat: 12.8342, lng: 79.7036, area: 'Transit Junction' },
  { name: 'Vellore Golden Fort', lat: 12.9165, lng: 79.1325, area: 'Inland Hub' },
];

export default function LocationPickerMap({
  latitude,
  longitude,
  destinationName,
  warehouses,
  onLocationSelect,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const destMarkerRef = useRef<LeafletType.Marker | null>(null);
  const warehouseMarkersRef = useRef<LeafletType.Marker[]>([]);
  const distanceLinesRef = useRef<LeafletType.Polyline[]>([]);
  const onLocationSelectRef = useRef(onLocationSelect);
  const warehousesRef = useRef(warehouses);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    warehousesRef.current = warehouses;
  }, [warehouses]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fallback defaults to Chennai center if coordinates are null
  const activeLat = latitude ?? 13.0827;
  const activeLng = longitude ?? 80.2707;

  // Haversine distance calculator
  const calculateDistanceKm = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }, []);

  // Reverse geocoding helper via Nominatim (with debounce/fallback)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const placeName =
          addr.suburb ||
          addr.neighbourhood ||
          addr.city_district ||
          addr.city ||
          addr.town ||
          addr.village ||
          data.display_name?.split(',')[0] ||
          `Loc (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
        return placeName;
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
    }
    return `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  }, []);

  // Update visual lines between destination and warehouses
  const updateVisualLines = useCallback(
    (destLat: number, destLng: number, L: typeof LeafletType) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing lines
      distanceLinesRef.current.forEach(line => line.remove());
      distanceLinesRef.current = [];

      warehousesRef.current.forEach(wh => {
        if (!wh.latitude || !wh.longitude) return;
        const dist = calculateDistanceKm(wh.latitude, wh.longitude, destLat, destLng);

        // Dashed connector line
        const polyline = L.polyline(
          [
            [wh.latitude, wh.longitude],
            [destLat, destLng],
          ],
          {
            color: '#dc2626',
            weight: 2,
            dashArray: '5, 8',
            opacity: 0.6,
          }
        ).addTo(map);

        polyline.bindTooltip(
          `<strong>${wh.name}</strong><br/>Route: ${dist} km`,
          { sticky: true, className: 'map-distance-tooltip' }
        );

        distanceLinesRef.current.push(polyline);
      });
    },
    [calculateDistanceKm]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let isMounted = true;

    import('leaflet').then(L => {
      if (!isMounted || !mapContainerRef.current) return;

      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [activeLat, activeLng],
        zoom: 10,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom icon for Warehouses
      const warehouseIcon = L.divIcon({
        className: 'custom-warehouse-pin',
        html: `
          <div style="transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;">
            <div style="background-color: #0f172a; color: white; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1px solid #334155; white-space: nowrap; margin-bottom: 2px;">
              🏢 Hub
            </div>
            <div style="width: 14px; height: 14px; background-color: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 2px #0284c7;"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      // Render Warehouse Markers
      warehouses.forEach(wh => {
        if (wh.latitude && wh.longitude) {
          const m = L.marker([wh.latitude, wh.longitude], { icon: warehouseIcon }).addTo(map);
          m.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
              <strong style="color: #0f172a; font-size: 13px;">${wh.name}</strong><br/>
              <span style="color: #64748b;">${wh.location}</span><br/>
              <span style="color: #059669; font-weight: 600;">Depot Active &bull; Cap: ${wh.availableCapacity}</span>
            </div>
          `);
          warehouseMarkersRef.current.push(m);
        }
      });

      // Custom icon for Destination
      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
            <div style="background-color: #dc2626; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; box-shadow: 0 3px 6px rgba(220,38,38,0.4); white-space: nowrap; margin-bottom: 3px;">
              📍 Drop-off
            </div>
            <div style="width: 18px; height: 18px; background-color: #dc2626; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 3px rgba(220,38,38,0.4);"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      // Add Destination Marker
      const destMarker = L.marker([activeLat, activeLng], {
        icon: destIcon,
        draggable: true,
      }).addTo(map);

      destMarkerRef.current = destMarker;

      // Handle marker drag end
      destMarker.on('dragend', async () => {
        const pos = destMarker.getLatLng();
        const lat = parseFloat(pos.lat.toFixed(4));
        const lng = parseFloat(pos.lng.toFixed(4));
        const placeName = await reverseGeocode(lat, lng);
        onLocationSelectRef.current({ name: placeName, latitude: lat, longitude: lng });
        updateVisualLines(lat, lng, L);
      });

      // Handle Map Click to place marker
      map.on('click', async (e: LeafletType.LeafletMouseEvent) => {
        const lat = parseFloat(e.latlng.lat.toFixed(4));
        const lng = parseFloat(e.latlng.lng.toFixed(4));

        destMarker.setLatLng([lat, lng]);
        updateVisualLines(lat, lng, L);

        const placeName = await reverseGeocode(lat, lng);
        onLocationSelectRef.current({ name: placeName, latitude: lat, longitude: lng });
      });

      // Initial visual lines
      updateVisualLines(activeLat, activeLng, L);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeLat, activeLng, reverseGeocode, updateVisualLines, warehouses]);

  // Synchronize map when latitude/longitude props change externally
  useEffect(() => {
    if (!latitude || !longitude) return;
    import('leaflet').then(L => {
      const marker = destMarkerRef.current;
      if (!marker) return;
      marker.setLatLng([latitude, longitude]);
      updateVisualLines(latitude, longitude, L);
    });
  }, [latitude, longitude, updateVisualLines]);

  // Handle Search Location submit
  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=in&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(parseFloat(data[0].lat).toFixed(4));
          const lng = parseFloat(parseFloat(data[0].lon).toFixed(4));
          const name = data[0].display_name.split(',')[0] || searchQuery;

          const map = mapInstanceRef.current;
          const marker = destMarkerRef.current;
          if (map && marker) {
            import('leaflet').then(L => {
              map.flyTo([lat, lng], 12, { duration: 1.2 });
              marker.setLatLng([lat, lng]);
              updateVisualLines(lat, lng, L);
            });
          }

          onLocationSelect({ name, latitude: lat, longitude: lng });
        } else {
          setSearchError('Location not found. Click directly on the map instead.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Search service unavailable. Click directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Fly to user location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        const placeName = await reverseGeocode(lat, lng);

        const map = mapInstanceRef.current;
        const marker = destMarkerRef.current;
        if (map && marker) {
          import('leaflet').then(L => {
            map.flyTo([lat, lng], 13, { duration: 1.2 });
            marker.setLatLng([lat, lng]);
            updateVisualLines(lat, lng, L);
          });
        }

        onLocationSelect({
          name: `Current Location (${placeName})`,
          latitude: lat,
          longitude: lng,
        });
      },
      () => {
        alert('Could not retrieve device location.');
      }
    );
  };

  // Handle Preset Click
  const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
    const map = mapInstanceRef.current;
    const marker = destMarkerRef.current;
    if (map && marker) {
      import('leaflet').then(L => {
        map.flyTo([preset.lat, preset.lng], 12, { duration: 1 });
        marker.setLatLng([preset.lat, preset.lng]);
        updateVisualLines(preset.lat, preset.lng, L);
      });
    }
    onLocationSelect({
      name: preset.name,
      latitude: preset.lat,
      longitude: preset.lng,
    });
  };

  return (
    <div className="space-y-3">
      {/* Search & Location Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search address, landmark or city in India (e.g. Tambaram, Guindy)..."
            className="w-full pl-9 pr-24 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500/20 text-slate-800"
          />
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="absolute right-1.5 px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition cursor-pointer flex items-center gap-1"
          >
            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          className="px-3 py-2 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Navigation className="w-3.5 h-3.5 text-red-600" />
          <span>My Device GPS</span>
        </button>
      </div>

      {searchError && <p className="text-[11px] text-red-500">{searchError}</p>}

      {/* Preset Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-400" /> Presets:
        </span>
        {PRESETS.map(p => (
          <button
            key={p.name}
            type="button"
            onClick={() => handlePresetSelect(p)}
            className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-700 transition cursor-pointer whitespace-nowrap"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Box */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        <div
          ref={mapContainerRef}
          className="w-full h-64 sm:h-72 z-10 bg-slate-100"
          style={{ minHeight: '260px' }}
        />

        {/* Live Distance & Selection Overlay Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-lg text-xs shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pointer-events-auto border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-semibold text-slate-100">
                {destinationName || 'Click anywhere on map to pin drop-off'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {latitude && longitude ? (
                <span>
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </span>
              ) : (
                <span>No pin selected</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 Tip: Click anywhere on the map or drag the red marker to set the exact delivery drop-off. Red dashed lines show direct distances to active depots.
      </p>
    </div>
  );
}
