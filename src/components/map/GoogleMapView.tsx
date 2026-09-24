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
  Hotel,
  PlaneLanding,
  PlaneTakeoff,
  Building2,
  Edit3,
  Compass,
  ArrowRight,
  Clock,
  Luggage,
  Sparkles
} from 'lucide-react';
import {
  resolveAirportLocation,
  resolveHotelCoordinates,
  SP_AIRPORTS,
  AirportLocation
} from '../../services/logisticsLocationService';
import { TripLogisticsModal } from '../logistics/TripLogisticsModal';

interface GoogleMapViewProps {
  onSelectPlace: (place: Place) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({ onSelectPlace }) => {
  const { trip, places, itineraryDays, updateTripLogistics } = useTrip();

  const [selectedDayId, setSelectedDayId] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedHubType, setSelectedHubType] = useState<'hotel' | 'arrival' | 'departure' | null>(null);

  // Logistics modal state
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [modalFocusSection, setModalFocusSection] = useState<'hotel' | 'arrival' | 'departure' | 'all'>('all');

  // Resolved Coordinates
  const [hotelCoords, setHotelCoords] = useState<{ lat: number; lng: number } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Resolve Airports
  const arrivalLoc = resolveAirportLocation(trip.arrivalAirport);
  const departureLoc = resolveAirportLocation(trip.departureAirport);

  // Resolve Hotel Coordinates dynamically if address/name exists
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const coords = await resolveHotelCoordinates(
        trip.hotelName,
        trip.hotelAddress,
        trip.hotelLat,
        trip.hotelLng
      );
      if (isMounted) {
        setHotelCoords(coords);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [trip.hotelName, trip.hotelAddress, trip.hotelLat, trip.hotelLng]);

  // Places for current selection
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
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CARTO Basemaps with API key
      const cartoApiKey = 'cb1_3u2s_1_a13452781362f0061b399cfd';
      L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoApiKey}`, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      leafletMapRef.current = map;
    }

    return () => {
      // Clean up map instance on unmount if necessary
    };
  }, []);

  // Update Markers, Hotel, Airports & Polylines
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const allBoundsPoints: L.LatLngExpression[] = [];

    // 1. Plot Tourist Places
    const dayLatLngs: L.LatLngExpression[] = [];
    displayedPlaces.forEach(({ place, order }) => {
      if (!place.lat || !place.lng) return;

      const position: [number, number] = [place.lat, place.lng];
      dayLatLngs.push(position);
      allBoundsPoints.push(position);

      const isDayRoute = selectedDayId !== 'all';
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-2xl ${
            isDayRoute ? 'bg-blue-600 ring-4 ring-blue-400/30' : 'bg-slate-900 ring-2 ring-slate-700'
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
        setSelectedHubType(null);
        setSelectedPlace(place);
      });
      markersLayer.addLayer(marker);
    });

    // 2. Plot Hotel Marker
    if (hotelCoords) {
      const hotelPos: [number, number] = [hotelCoords.lat, hotelCoords.lng];
      allBoundsPoints.push(hotelPos);

      const hotelMarkerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600 ring-4 ring-indigo-400/40 text-white flex items-center justify-center shadow-2xl font-bold text-base transform hover:scale-110 transition-transform">
            🏨
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-600 rotate-45"></div>
        </div>
      `;

      const hotelIcon = L.divIcon({
        className: 'custom-map-pin-hotel',
        html: hotelMarkerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const hotelMarker = L.marker(hotelPos, { icon: hotelIcon, zIndexOffset: 1000 });
      hotelMarker.on('click', () => {
        setSelectedPlace(null);
        setSelectedHubType('hotel');
      });
      markersLayer.addLayer(hotelMarker);
    }

    // 3. Plot Arrival Airport (Desembarque)
    if (arrivalLoc) {
      const arrPos: [number, number] = [arrivalLoc.lat, arrivalLoc.lng];
      allBoundsPoints.push(arrPos);

      const arrivalHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-10 h-10 rounded-2xl bg-cyan-600 ring-4 ring-cyan-400/40 text-white flex items-center justify-center shadow-2xl font-bold text-base transform hover:scale-110 transition-transform">
            🛬
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-cyan-600 rotate-45"></div>
        </div>
      `;

      const arrIcon = L.divIcon({
        className: 'custom-map-pin-arrival',
        html: arrivalHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const arrMarker = L.marker(arrPos, { icon: arrIcon, zIndexOffset: 900 });
      arrMarker.on('click', () => {
        setSelectedPlace(null);
        setSelectedHubType('arrival');
      });
      markersLayer.addLayer(arrMarker);

      // Transfer Line: Arrival Airport ➔ Hotel
      if (hotelCoords) {
        L.polyline([arrPos, [hotelCoords.lat, hotelCoords.lng]], {
          color: '#06b6d4',
          weight: 3,
          opacity: 0.6,
          dashArray: '6, 8',
        }).addTo(markersLayer);
      }
    }

    // 4. Plot Departure Airport (Embarque) - only separate pin if different from arrival
    if (departureLoc && departureLoc.code !== arrivalLoc?.code) {
      const depPos: [number, number] = [departureLoc.lat, departureLoc.lng];
      allBoundsPoints.push(depPos);

      const depHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-10 h-10 rounded-2xl bg-amber-600 ring-4 ring-amber-400/40 text-white flex items-center justify-center shadow-2xl font-bold text-base transform hover:scale-110 transition-transform">
            🛫
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-600 rotate-45"></div>
        </div>
      `;

      const depIcon = L.divIcon({
        className: 'custom-map-pin-departure',
        html: depHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const depMarker = L.marker(depPos, { icon: depIcon, zIndexOffset: 900 });
      depMarker.on('click', () => {
        setSelectedPlace(null);
        setSelectedHubType('departure');
      });
      markersLayer.addLayer(depMarker);

      // Transfer Line: Hotel ➔ Departure Airport
      if (hotelCoords) {
        L.polyline([[hotelCoords.lat, hotelCoords.lng], depPos], {
          color: '#f59e0b',
          weight: 3,
          opacity: 0.6,
          dashArray: '6, 8',
        }).addTo(markersLayer);
      }
    }

    // 5. Connect itinerary stops for specific day
    if (selectedDayId !== 'all' && dayLatLngs.length > 1) {
      const polyline = L.polyline(dayLatLngs, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      routePolylineRef.current = polyline;
    }

    // 6. Adjust Map Bounds to include places, hotel and airports
    if (allBoundsPoints.length > 0) {
      const bounds = L.latLngBounds(allBoundsPoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    } else {
      map.setView([-23.561494, -46.655881], 12);
    }
  }, [displayedPlaces, selectedDayId, hotelCoords, arrivalLoc, departureLoc]);

  // Center / FlyTo Actions
  const handleFlyTo = (lat: number, lng: number, zoom = 15) => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  const handleOpenLogisticsModal = (section: 'hotel' | 'arrival' | 'departure' | 'all') => {
    setModalFocusSection(section);
    setIsLogisticsModalOpen(true);
  };

  const handleQuickSetAirport = (code: 'CGH' | 'GRU', field: 'arrival' | 'departure') => {
    const airport = SP_AIRPORTS[code];
    if (field === 'arrival') {
      updateTripLogistics({ arrivalAirport: airport.fullName });
    } else {
      updateTripLogistics({ departureAirport: airport.fullName });
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* 1. TOP LOGISTICS HUBS BAR: Embarque, Desembarque & Hotel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Hubs Principais da Viagem
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Hospedagem, Desembarque & Embarque
            </h3>
          </div>
          <button
            onClick={() => handleOpenLogisticsModal('all')}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Editar Todos</span>
          </button>
        </div>

        {/* 3 Interactive Logistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* A. Hotel Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5 transition-all hover:border-indigo-500/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Hotel className="w-3.5 h-3.5" />
                  Hospedagem / Hotel
                </span>
                {hotelCoords ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    No Mapa
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    A Definir
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                {trip.hotelName || 'Nenhum hotel cadastrado'}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {trip.hotelAddress || 'Onde o grupo vai ficar em São Paulo'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
              {hotelCoords ? (
                <button
                  onClick={() => {
                    handleFlyTo(hotelCoords.lat, hotelCoords.lng, 16);
                    setSelectedPlace(null);
                    setSelectedHubType('hotel');
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Ver no Mapa</span>
                </button>
              ) : null}
              <button
                onClick={() => handleOpenLogisticsModal('hotel')}
                className={`${
                  hotelCoords ? 'px-3' : 'w-full'
                } py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors`}
              >
                <span>{hotelCoords ? 'Editar' : '+ Definir Hotel'}</span>
              </button>
            </div>
          </div>

          {/* B. Desembarque / Chegada Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5 transition-all hover:border-cyan-500/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <PlaneLanding className="w-3.5 h-3.5" />
                  Desembarque (Chegada)
                </span>
                {arrivalLoc ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {arrivalLoc.code}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    A Definir
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                {arrivalLoc?.name || trip.arrivalAirport || 'Aeroporto de Chegada'}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {trip.arrivalFlight
                  ? `Voo: ${trip.arrivalFlight} ${trip.arrivalDateTime ? `• ${trip.arrivalDateTime}` : ''}`
                  : 'Aeroporto onde pousaremos'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
              {arrivalLoc ? (
                <button
                  onClick={() => {
                    handleFlyTo(arrivalLoc.lat, arrivalLoc.lng, 15);
                    setSelectedPlace(null);
                    setSelectedHubType('arrival');
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Ver no Mapa</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    onClick={() => handleQuickSetAirport('CGH', 'arrival')}
                    className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                  >
                    + Congonhas
                  </button>
                  <button
                    onClick={() => handleQuickSetAirport('GRU', 'arrival')}
                    className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                  >
                    + Guarulhos
                  </button>
                </div>
              )}
              <button
                onClick={() => handleOpenLogisticsModal('arrival')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span>{arrivalLoc ? 'Editar' : 'Mais'}</span>
              </button>
            </div>
          </div>

          {/* C. Embarque / Partida Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5 transition-all hover:border-amber-500/40">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <PlaneTakeoff className="w-3.5 h-3.5" />
                  Embarque (Retorno)
                </span>
                {departureLoc ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {departureLoc.code}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    A Definir
                  </span>
                )}
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                {departureLoc?.name || trip.departureAirport || 'Aeroporto de Retorno'}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {trip.departureFlight
                  ? `Voo: ${trip.departureFlight} ${trip.departureDateTime ? `• ${trip.departureDateTime}` : ''}`
                  : 'Aeroporto onde decolaremos'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
              {departureLoc ? (
                <button
                  onClick={() => {
                    handleFlyTo(departureLoc.lat, departureLoc.lng, 15);
                    setSelectedPlace(null);
                    setSelectedHubType('departure');
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Ver no Mapa</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 w-full">
                  <button
                    onClick={() => handleQuickSetAirport('CGH', 'departure')}
                    className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                  >
                    + Congonhas
                  </button>
                  <button
                    onClick={() => handleQuickSetAirport('GRU', 'departure')}
                    className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                  >
                    + Guarulhos
                  </button>
                </div>
              )}
              <button
                onClick={() => handleOpenLogisticsModal('departure')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span>{departureLoc ? 'Editar' : 'Mais'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. MAP HEADER & DAY SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            Mapa Interativo & Rotas de SP
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5">
            Visualização de Rota & Locais 🗺️
          </h2>
        </div>

        {/* Day & Hub Selector Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedDayId('all');
              setSelectedPlace(null);
              setSelectedHubType(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 ${
              selectedDayId === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos ({places.length})
          </button>

          {/* Quick Focus Pills */}
          {hotelCoords && (
            <button
              onClick={() => {
                handleFlyTo(hotelCoords.lat, hotelCoords.lng, 16);
                setSelectedPlace(null);
                setSelectedHubType('hotel');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 flex items-center gap-1 shrink-0 active:scale-95"
            >
              <span>🏨 Hotel</span>
            </button>
          )}

          {(arrivalLoc || departureLoc) && (
            <button
              onClick={() => {
                const target = arrivalLoc || departureLoc;
                if (target) {
                  handleFlyTo(target.lat, target.lng, 14);
                  setSelectedPlace(null);
                  setSelectedHubType(arrivalLoc ? 'arrival' : 'departure');
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 flex items-center gap-1 shrink-0 active:scale-95"
            >
              <span>✈️ Aeroportos</span>
            </button>
          )}

          {itineraryDays.map(day => (
            <button
              key={day.id}
              onClick={() => {
                setSelectedDayId(day.id);
                setSelectedPlace(null);
                setSelectedHubType(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 active:scale-95 ${
                selectedDayId === day.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Dia {day.dayNumber}</span>
              <span className="text-[10px] opacity-80">({day.items.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAP VIEWPORT & INTERACTIVE OVERLAYS */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[65vh] sm:h-[620px] w-full">
        
        {/* Leaflet Map container */}
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>

        {/* Selected Tourist Place Bottom Popup Card */}
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
                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
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
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-semibold shadow-md transition-colors active:scale-95"
                >
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Hub Popup Card: Hotel */}
        {selectedHubType === 'hotel' && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-20 sm:max-w-md bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 text-xl">
                  🏨
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                    Nosso Hotel / Hospedagem
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">
                    {trip.hotelName || 'Hotel a definir'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {trip.hotelAddress || 'Endereço não informado'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHubType(null)}
                className="text-slate-400 hover:text-white p-1 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Check-in</span>
                <span className="text-slate-200 font-medium">{trip.hotelCheckin || 'A definir'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Check-out</span>
                <span className="text-slate-200 font-medium">{trip.hotelCheckout || 'A definir'}</span>
              </div>
            </div>

            {trip.hotelNotes && (
              <p className="text-[11px] text-slate-400 mt-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                💡 {trip.hotelNotes}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800">
              {trip.hotelAddress || trip.hotelName ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${trip.hotelName || ''} ${trip.hotelAddress || ''}, São Paulo - SP`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : null}

              <button
                onClick={() => handleOpenLogisticsModal('hotel')}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors active:scale-95"
              >
                Editar Hospedagem
              </button>
            </div>
          </div>
        )}

        {/* Selected Hub Popup Card: Desembarque (Arrival Airport) */}
        {selectedHubType === 'arrival' && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-20 sm:max-w-md bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 text-xl">
                  🛬
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300">
                    Desembarque / Chegada em SP
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">
                    {arrivalLoc?.fullName || trip.arrivalAirport || 'Aeroporto de Chegada'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {arrivalLoc?.description || 'Ponto de desembarque do voo'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHubType(null)}
                className="text-slate-400 hover:text-white p-1 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Voo & Companhia</span>
                <span className="text-slate-200 font-medium">{trip.arrivalFlight || 'A definir'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Horário de Pouso</span>
                <span className="text-slate-200 font-medium">{trip.arrivalDateTime || 'A definir'}</span>
              </div>
            </div>

            {arrivalLoc?.terminalTip && (
              <p className="text-[11px] text-cyan-300/90 mt-2 bg-cyan-950/40 p-2 rounded-xl border border-cyan-800/50">
                🚇 {arrivalLoc.terminalTip}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800">
              {trip.hotelAddress && arrivalLoc ? (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                    arrivalLoc.fullName
                  )}&destination=${encodeURIComponent(
                    trip.hotelAddress
                  )}&travelmode=transit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Rota Aeroporto ➔ Hotel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : null}

              <button
                onClick={() => handleOpenLogisticsModal('arrival')}
                className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors active:scale-95"
              >
                Editar Voo
              </button>
            </div>
          </div>
        )}

        {/* Selected Hub Popup Card: Embarque (Departure Airport) */}
        {selectedHubType === 'departure' && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-20 sm:max-w-md bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 text-xl">
                  🛫
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                    Embarque / Voo de Retorno
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">
                    {departureLoc?.fullName || trip.departureAirport || 'Aeroporto de Partida'}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {departureLoc?.description || 'Ponto de embarque para o retorno'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHubType(null)}
                className="text-slate-400 hover:text-white p-1 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Voo & Companhia</span>
                <span className="text-slate-200 font-medium">{trip.departureFlight || 'A definir'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Horário de Decolagem</span>
                <span className="text-slate-200 font-medium">{trip.departureDateTime || 'A definir'}</span>
              </div>
            </div>

            {departureLoc?.terminalTip && (
              <p className="text-[11px] text-amber-300/90 mt-2 bg-amber-950/40 p-2 rounded-xl border border-amber-800/50">
                🚇 {departureLoc.terminalTip}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800">
              {trip.hotelAddress && departureLoc ? (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                    trip.hotelAddress
                  )}&destination=${encodeURIComponent(
                    departureLoc.fullName
                  )}&travelmode=transit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Rota Hotel ➔ Aeroporto</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : null}

              <button
                onClick={() => handleOpenLogisticsModal('departure')}
                className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors active:scale-95"
              >
                Editar Voo
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Shared Logistics Modal */}
      <TripLogisticsModal
        isOpen={isLogisticsModalOpen}
        onClose={() => setIsLogisticsModalOpen(false)}
        focusSection={modalFocusSection}
      />

    </div>
  );
};
