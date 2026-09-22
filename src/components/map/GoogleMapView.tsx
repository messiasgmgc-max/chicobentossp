import React, { useEffect, useRef, useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { Place } from '../../types';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Calendar,
  Train,
  Star,
  Layers,
  Map as MapIcon
} from 'lucide-react';

interface GoogleMapViewProps {
  onSelectPlace: (place: Place) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({ onSelectPlace }) => {
  const { places, itineraryDays } = useTrip();
  const [selectedDayId, setSelectedDayId] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Get places for current selection
  const currentDay = itineraryDays.find(d => d.id === selectedDayId);
  
  const displayedPlaces: { place: Place; order?: number }[] =
    selectedDayId === 'all'
      ? places.map(p => ({ place: p }))
      : (currentDay?.items || [])
          .map((item, idx) => ({
            place: places.find(p => p.id === item.placeId)!,
            order: idx + 1,
          }))
          .filter(item => Boolean(item.place));

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      // Default SP center (Praça da Sé / Av. Paulista area)
      const map = L.map(mapContainerRef.current, {
        center: [-23.561494, -46.655881],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark Mode / Clean Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      leafletMapRef.current = map;
    }

    return () => {
      // Leaflet cleanup if needed
    };
  }, []);

  // Update Markers & Polylines when selectedDay or places change
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers and polylines
    markersLayer.clearLayers();
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const latLngs: L.LatLngExpression[] = [];

    displayedPlaces.forEach(({ place, order }) => {
      if (!place.lat || !place.lng) return;

      const position: [number, number] = [place.lat, place.lng];
      latLngs.push(position);

      // Create Custom HTML Marker Icon
      const isDayRoute = selectedDayId !== 'all';
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-2xl ${
            isDayRoute ? 'bg-orange-600 ring-4 ring-orange-400/30' : 'bg-slate-900 ring-2 ring-slate-700'
          } text-white flex items-center justify-center shadow-xl font-bold text-xs transform hover:scale-110 transition-transform">
            ${order !== undefined ? order : '📍'}
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-inherit rotate-45"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker(position, { icon: customIcon });

      marker.on('click', () => {
        setSelectedPlace(place);
      });

      markersLayer.addLayer(marker);
    });

    // Draw route polyline connecting the day's stops
    if (selectedDayId !== 'all' && latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#ea580c',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      routePolylineRef.current = polyline;
    }

    // Adjust bounds to fit all points
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [displayedPlaces, selectedDayId]);

  // Generate Google Maps Directions link for the active day
  const generateGoogleMapsRouteUrl = () => {
    if (displayedPlaces.length === 0) return '#';

    if (displayedPlaces.length === 1) {
      const p = displayedPlaces[0].place;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${p.name}, ${p.address || p.neighborhood}, São Paulo - SP`
      )}`;
    }

    const origin = encodeURIComponent(`${displayedPlaces[0].place.name}, ${displayedPlaces[0].place.neighborhood}, São Paulo`);
    const destination = encodeURIComponent(
      `${displayedPlaces[displayedPlaces.length - 1].place.name}, ${displayedPlaces[displayedPlaces.length - 1].place.neighborhood}, São Paulo`
    );

    const waypoints = displayedPlaces
      .slice(1, -1)
      .map(item => encodeURIComponent(`${item.place.name}, ${item.place.neighborhood}, São Paulo`))
      .join('|');

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
      waypoints ? `&waypoints=${waypoints}` : ''
    }&travelmode=transit`;
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Map Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            Mapa Interativo & Rotas de SP
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5">
            Visualização de Rota & Locais 🗺️
          </h2>
        </div>

        {/* Day Selector Pills for Map */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedDayId('all');
              setSelectedPlace(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
              selectedDayId === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos ({places.length})
          </button>

          {itineraryDays.map(day => (
            <button
              key={day.id}
              onClick={() => {
                setSelectedDayId(day.id);
                setSelectedPlace(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 active:scale-95 ${
                selectedDayId === day.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Dia {day.dayNumber}</span>
              <span className="text-[10px] opacity-80">({day.items.length})</span>
            </button>
          ))}
        </div>

        {/* Action: Open in Google Maps */}
        {displayedPlaces.length > 0 && (
          <a
            href={generateGoogleMapsRouteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 shrink-0 transition-colors active:scale-95 text-center"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Abrir Rota no Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Map Viewport & Interactive Overlay */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[65vh] sm:h-[620px] w-full">
        
        {/* Leaflet/OpenStreetMap container */}
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>

        {/* Floating Day Stops Drawer (Desktop Only) */}
        {selectedDayId !== 'all' && currentDay && (
          <div className="absolute top-4 left-4 z-10 max-w-xs w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-3.5 hidden sm:block">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                {currentDay.title}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                {displayedPlaces.length} paradas
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {displayedPlaces.map(({ place, order }) => (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className={`p-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                    selectedPlace?.id === place.id
                      ? 'bg-orange-500/20 text-white border border-orange-500/40'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-lg bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {order}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{place.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{place.neighborhood}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Place Bottom Popup Card (Mobile + Desktop) */}
        {selectedPlace && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-20 sm:max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-3xl shadow-2xl p-3.5 sm:p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex gap-2.5 min-w-0">
                <img
                  src={selectedPlace.photoUrl}
                  alt={selectedPlace.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover shrink-0 border border-slate-700 shadow-md"
                />
                <div className="min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {selectedPlace.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">{selectedPlace.name}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                    <span>{selectedPlace.neighborhood}</span>
                  </p>
                  {selectedPlace.metroStation && (
                    <p className="text-[10px] sm:text-[11px] text-cyan-400 flex items-center gap-1 mt-0.5 font-medium truncate">
                      <Train className="w-3 h-3 shrink-0" />
                      <span>{selectedPlace.metroStation}</span>
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedPlace(null)}
                className="text-slate-400 hover:text-white p-1 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {selectedPlace.rating}
                </span>
                <span>•</span>
                <span>~{selectedPlace.estimatedTimeMins}m</span>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedPlace.name}, ${selectedPlace.address || selectedPlace.neighborhood}, São Paulo - SP`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  <span>GPS</span>
                </a>

                <button
                  onClick={() => onSelectPlace(selectedPlace)}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[11px] font-bold shadow-md transition-colors active:scale-95"
                >
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
