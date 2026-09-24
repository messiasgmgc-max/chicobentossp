import { Trip } from '../types';

export interface AirportLocation {
  code: 'CGH' | 'GRU' | 'VCP';
  name: string;
  fullName: string;
  lat: number;
  lng: number;
  description: string;
  metroLine?: string;
  terminalTip?: string;
}

// Fixed GPS coordinates for São Paulo airports
export const SP_AIRPORTS: Record<'CGH' | 'GRU' | 'VCP', AirportLocation> = {
  CGH: {
    code: 'CGH',
    name: 'Aeroporto de Congonhas',
    fullName: 'Aeroporto de São Paulo / Congonhas (CGH)',
    lat: -23.6273,
    lng: -46.6565,
    description: 'Zona Sul de São Paulo • Próximo a Moema / Vila Mariana / Paulista',
    metroLine: 'Próximo a São Judas (Linha 1-Azul)',
    terminalTip: 'Mais perto da região central e da Av. Paulista (~25 min de carro/Uber).'
  },
  GRU: {
    code: 'GRU',
    name: 'Aeroporto de Guarulhos',
    fullName: 'Aeroporto Internacional de São Paulo / Guarulhos (GRU - Cumbica)',
    lat: -23.4356,
    lng: -46.4731,
    description: 'Guarulhos (Cumbica) • Terminal 1, 2 e 3',
    metroLine: 'Linha 13-Jade da CPTM (Expresso Aeroporto)',
    terminalTip: 'Maior aeroporto do país (~45-60 min da Av. Paulista).'
  },
  VCP: {
    code: 'VCP',
    name: 'Aeroporto de Viracopos',
    fullName: 'Aeroporto Internacional de Viracopos (VCP - Campinas)',
    lat: -23.0074,
    lng: -47.1345,
    description: 'Campinas - SP • Principal Hub da Azul',
    terminalTip: 'Fica a cerca de 95 km da capital (~1h30 de ônibus executivo/carro).'
  }
};

/**
 * Identify airport coordinates from arbitrary string (e.g. "Aeroporto de Congonhas (CGH)", "GRU", "Guarulhos")
 */
export function resolveAirportLocation(airportText?: string): AirportLocation | null {
  if (!airportText || typeof airportText !== 'string') return null;

  const text = airportText.toUpperCase().trim();

  if (text.includes('CGH') || text.includes('CONGONHAS')) {
    return SP_AIRPORTS.CGH;
  }
  if (text.includes('GRU') || text.includes('GUARULHOS') || text.includes('CUMBICA')) {
    return SP_AIRPORTS.GRU;
  }
  if (text.includes('VCP') || text.includes('VIRACOPOS') || text.includes('CAMPINAS')) {
    return SP_AIRPORTS.VCP;
  }

  return null;
}

/**
 * In-memory cache for geocoded hotel coordinates
 */
const hotelGeocodeCache = new Map<string, { lat: number; lng: number }>();

/**
 * Tries to resolve Hotel latitude & longitude:
 * 1. Checks if trip already has `hotelLat` and `hotelLng`
 * 2. Checks local cache
 * 3. Fallback to OpenStreetMap geocoding via Photon
 */
export async function resolveHotelCoordinates(
  hotelName?: string,
  hotelAddress?: string,
  existingLat?: number,
  existingLng?: number
): Promise<{ lat: number; lng: number } | null> {
  // 1. If explicit coordinates exist and are valid numbers
  if (
    typeof existingLat === 'number' &&
    typeof existingLng === 'number' &&
    !isNaN(existingLat) &&
    !isNaN(existingLng) &&
    existingLat !== 0 &&
    existingLng !== 0
  ) {
    return { lat: existingLat, lng: existingLng };
  }

  const query = (hotelAddress || hotelName || '').trim();
  if (query.length < 3) return null;

  // 2. Check in-memory cache
  if (hotelGeocodeCache.has(query)) {
    return hotelGeocodeCache.get(query)!;
  }

  // 3. Online geocode via Photon (OSM)
  try {
    const encoded = encodeURIComponent(`${query}, São Paulo, Brasil`);
    const res = await fetch(`https://photon.komoot.io/api/?q=${encoded}&lat=-23.561494&lon=-46.655881&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates; // [lng, lat]
        const result = { lat: coords[1], lng: coords[0] };
        hotelGeocodeCache.set(query, result);
        return result;
      }
    }
  } catch {
    // Ignore network error in geocoding
  }

  // Fallback to Av. Paulista center if hotel mention matches Paulista
  if (query.toLowerCase().includes('paulista')) {
    const paulistaCoords = { lat: -23.561494, lng: -46.655881 };
    hotelGeocodeCache.set(query, paulistaCoords);
    return paulistaCoords;
  }

  return null;
}
