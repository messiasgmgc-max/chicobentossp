import { PlaceCategory } from '../types';
import { getGoogleMapsApiKey } from '../lib/supabase';

export interface PlaceSearchResult {
  id: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  neighborhood: string;
  category: PlaceCategory;
  rawType?: string;
  metroStation?: string;
  metroLine?: string;
  source: 'google' | 'osm';
}

interface MetroStationRef {
  name: string;
  line: string;
  lat: number;
  lng: number;
}

// Major São Paulo metro stations for intelligent route & stop linking
export const SP_METRO_STATIONS: MetroStationRef[] = [
  { name: 'Paulista', line: 'Linha 4-Amarela', lat: -23.5553, lng: -46.6622 },
  { name: 'Consolação', line: 'Linha 2-Verde', lat: -23.5579, lng: -46.6601 },
  { name: 'Trianon-MASP', line: 'Linha 2-Verde', lat: -23.5634, lng: -46.6548 },
  { name: 'Brigadeiro', line: 'Linha 2-Verde', lat: -23.5687, lng: -46.6477 },
  { name: 'Higienópolis-Mackenzie', line: 'Linha 4-Amarela', lat: -23.5487, lng: -46.6521 },
  { name: 'República', line: 'Linha 3-Vermelha / Linha 4-Amarela', lat: -23.5442, lng: -46.6433 },
  { name: 'Anhangabaú', line: 'Linha 3-Vermelha', lat: -23.5478, lng: -46.6387 },
  { name: 'Sé', line: 'Linha 1-Azul / Linha 3-Vermelha', lat: -23.5501, lng: -46.6339 },
  { name: 'São Bento', line: 'Linha 1-Azul', lat: -23.5444, lng: -46.6341 },
  { name: 'Luz', line: 'Linha 1-Azul / Linha 4-Amarela', lat: -23.5365, lng: -46.6353 },
  { name: 'Japão-Liberdade', line: 'Linha 1-Azul', lat: -23.5550, lng: -46.6355 },
  { name: 'São Joaquim', line: 'Linha 1-Azul', lat: -23.5615, lng: -46.6389 },
  { name: 'Vergueiro', line: 'Linha 1-Azul', lat: -23.5714, lng: -46.6401 },
  { name: 'Paraíso', line: 'Linha 1-Azul / Linha 2-Verde', lat: -23.5760, lng: -46.6416 },
  { name: 'Ana Rosa', line: 'Linha 1-Azul / Linha 2-Verde', lat: -23.5815, lng: -46.6385 },
  { name: 'Vila Mariana', line: 'Linha 1-Azul', lat: -23.5895, lng: -46.6343 },
  { name: 'Santa Cruz', line: 'Linha 1-Azul / Linha 5-Lilás', lat: -23.5990, lng: -46.6366 },
  { name: 'Oscar Freire', line: 'Linha 4-Amarela', lat: -23.5606, lng: -46.6718 },
  { name: 'Fradique Coutinho', line: 'Linha 4-Amarela', lat: -23.5663, lng: -46.6843 },
  { name: 'Faria Lima', line: 'Linha 4-Amarela', lat: -23.5673, lng: -46.6941 },
  { name: 'Pinheiros', line: 'Linha 4-Amarela / Linha 9-Esmeralda', lat: -23.5664, lng: -46.7029 },
  { name: 'Vila Madalena', line: 'Linha 2-Verde', lat: -23.5463, lng: -46.6908 },
  { name: 'Santuário N. Sra. de Fátima-Sumaré', line: 'Linha 2-Verde', lat: -23.5507, lng: -46.6784 },
  { name: 'Clínicas', line: 'Linha 2-Verde', lat: -23.5546, lng: -46.6706 },
  { name: 'Palmeiras-Barra Funda', line: 'Linha 3-Vermelha', lat: -23.5255, lng: -46.6669 },
  { name: 'Moema', line: 'Linha 5-Lilás', lat: -23.6041, lng: -46.6617 },
  { name: 'AACD-Servidor (Ibirapuera)', line: 'Linha 5-Lilás', lat: -23.5976, lng: -46.6528 },
  { name: 'Santana', line: 'Linha 1-Azul', lat: -23.5028, lng: -46.6247 },
];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestMetroStation(lat: number, lng: number): { station: string; line: string } | null {
  let nearest: MetroStationRef | null = null;
  let minDistance = Infinity;

  for (const station of SP_METRO_STATIONS) {
    const dist = getDistanceKm(lat, lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  // If within 1.5 km of a metro station, suggest it
  if (nearest && minDistance <= 1.5) {
    return {
      station: `Estação ${nearest.name}`,
      line: nearest.line,
    };
  }

  return null;
}

export function inferPlaceCategory(type?: string, name?: string, address?: string): PlaceCategory {
  const t = (type || '').toLowerCase();
  const text = `${name || ''} ${address || ''}`.toLowerCase();

  if (
    t.includes('restaurant') ||
    t.includes('food') ||
    t.includes('pizza') ||
    t.includes('burger') ||
    t.includes('steak') ||
    t.includes('sushi') ||
    text.includes('restaurante') ||
    text.includes('pizzaria') ||
    text.includes('hamburgueria') ||
    text.includes('cantina') ||
    text.includes('churrascaria') ||
    text.includes('lanchonete') ||
    text.includes('gastronomia')
  ) {
    return 'gastronomia';
  }

  if (
    t.includes('bar') ||
    t.includes('pub') ||
    t.includes('nightclub') ||
    t.includes('brewery') ||
    text.includes('bar') ||
    text.includes('boteco') ||
    text.includes('choperia') ||
    text.includes('balada') ||
    text.includes('cervejaria')
  ) {
    return 'vida_noturna';
  }

  if (
    t.includes('cafe') ||
    t.includes('bakery') ||
    t.includes('coffee') ||
    text.includes('café') ||
    text.includes('cafe') ||
    text.includes('padaria') ||
    text.includes('doce') ||
    text.includes('confeitaria') ||
    text.includes('sorvete') ||
    text.includes('gelato')
  ) {
    return 'cafe';
  }

  if (
    t.includes('museum') ||
    t.includes('theatre') ||
    t.includes('art') ||
    t.includes('gallery') ||
    t.includes('cinema') ||
    t.includes('historic') ||
    text.includes('museu') ||
    text.includes('teatro') ||
    text.includes('cinema') ||
    text.includes('centro cultural') ||
    text.includes('pinacoteca') ||
    text.includes('masp') ||
    text.includes('instituto') ||
    text.includes('fundação') ||
    text.includes('sesc') ||
    text.includes('memorial')
  ) {
    return 'cultura';
  }

  if (
    t.includes('park') ||
    t.includes('garden') ||
    t.includes('zoo') ||
    t.includes('nature') ||
    text.includes('parque') ||
    text.includes('praça') ||
    text.includes('jardim') ||
    text.includes('bosque')
  ) {
    return 'parque';
  }

  if (
    t.includes('mall') ||
    t.includes('shop') ||
    t.includes('department_store') ||
    t.includes('market') ||
    text.includes('shopping') ||
    text.includes('loja') ||
    text.includes('mercado municipal') ||
    text.includes('feirinha') ||
    text.includes('galeria')
  ) {
    return 'compras';
  }

  return 'ponto_turistico';
}

// In-memory cache for fast repeated searches
const searchCache = new Map<string, PlaceSearchResult[]>();

// Dynamic Google Maps JS loader
let googleMapsLoadingPromise: Promise<void> | null = null;
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).google?.maps?.places) return Promise.resolve();

  if (!googleMapsLoadingPromise) {
    googleMapsLoadingPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('google-maps-places-script');
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-places-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = err => reject(err);
      document.head.appendChild(script);
    });
  }
  return googleMapsLoadingPromise;
}

// Search with Google Places Autocomplete if API key is active
async function searchWithGooglePlaces(query: string, apiKey: string): Promise<PlaceSearchResult[]> {
  try {
    await loadGoogleMapsScript(apiKey);
    const google = (window as any).google;
    if (!google?.maps?.places) return [];

    return new Promise<PlaceSearchResult[]>(resolve => {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'br' },
          locationBias: new google.maps.Circle({
            center: { lat: -23.5505, lng: -46.6333 },
            radius: 40000,
          }),
        },
        async (predictions: any[], status: string) => {
          if (status !== 'OK' || !predictions || predictions.length === 0) {
            resolve([]);
            return;
          }

          // Fetch details for top 5 results to get lat/lng
          const placesService = new google.maps.places.PlacesService(document.createElement('div'));
          const topPredictions = predictions.slice(0, 5);

          const detailPromises = topPredictions.map((pred: any) => {
            return new Promise<PlaceSearchResult | null>(detailResolve => {
              placesService.getDetails(
                {
                  placeId: pred.place_id,
                  fields: ['name', 'formatted_address', 'geometry', 'types', 'address_components'],
                },
                (place: any, placeStatus: string) => {
                  if (placeStatus !== 'OK' || !place?.geometry?.location) {
                    detailResolve(null);
                    return;
                  }

                  const lat = place.geometry.location.lat();
                  const lng = place.geometry.location.lng();
                  const name = place.name || pred.structured_formatting?.main_text || query;
                  const address = place.formatted_address || pred.description;

                  let neighborhood = 'São Paulo';
                  if (place.address_components) {
                    const subLoc = place.address_components.find((c: any) =>
                      c.types.includes('sublocality') || c.types.includes('sublocality_level_1') || c.types.includes('neighborhood')
                    );
                    if (subLoc) neighborhood = subLoc.long_name;
                  }

                  const category = inferPlaceCategory(place.types?.[0], name, address);
                  const nearestMetro = findNearestMetroStation(lat, lng);

                  detailResolve({
                    id: `g-${pred.place_id}`,
                    name,
                    formattedAddress: address,
                    lat,
                    lng,
                    neighborhood,
                    category,
                    rawType: place.types?.[0],
                    metroStation: nearestMetro?.station,
                    metroLine: nearestMetro?.line,
                    source: 'google',
                  });
                }
              );
            });
          });

          const results = (await Promise.all(detailPromises)).filter(Boolean) as PlaceSearchResult[];
          resolve(results);
        }
      );
    });
  } catch (err) {
    console.warn('Google Places API search failed, falling back:', err);
    return [];
  }
}

// Search with Photon (OpenStreetMap geocoding engine with CORS support & fast São Paulo responses)
async function searchWithPhoton(cleanQuery: string): Promise<PlaceSearchResult[]> {
  try {
    // Biased to São Paulo center (-23.5505, -46.6333)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      cleanQuery
    )}&lat=-23.5505&lon=-46.6333&limit=8`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data?.features || !Array.isArray(data.features)) return [];

    const results: PlaceSearchResult[] = [];

    for (const f of data.features) {
      const p = f.properties || {};
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length < 2) continue;

      const lng = coords[0];
      const lat = coords[1];

      // Filter to broader SP state area (lat between -24.5 and -22.5, lng between -48.0 and -45.5)
      // to ensure high relevance for Chico Bento SP trip
      if (lat < -24.5 || lat > -22.5 || lng < -48.0 || lng > -45.5) {
        continue;
      }

      const name = p.name || p.street || cleanQuery;
      const street = p.street || '';
      const houseNumber = p.housenumber ? `, ${p.housenumber}` : '';
      const neighborhood = p.district || p.locality || p.suburb || 'São Paulo';
      const city = p.city || 'São Paulo';

      let formattedAddress = `${name}`;
      if (street && street !== name) {
        formattedAddress = `${street}${houseNumber} - ${neighborhood}, ${city} - SP`;
      } else if (neighborhood) {
        formattedAddress = `${name} - ${neighborhood}, ${city} - SP`;
      }

      const rawType = p.osm_value || p.osm_key || p.type || '';
      const category = inferPlaceCategory(rawType, name, formattedAddress);
      const nearestMetro = findNearestMetroStation(lat, lng);

      results.push({
        id: `osm-${p.osm_id || Math.random().toString(36).substring(7)}`,
        name,
        formattedAddress,
        lat,
        lng,
        neighborhood,
        category,
        rawType,
        metroStation: nearestMetro?.station,
        metroLine: nearestMetro?.line,
        source: 'osm',
      });
    }

    return results;
  } catch (err) {
    console.warn('Photon search error:', err);
    return [];
  }
}

// Search with Nominatim (backup fallback)
async function searchWithNominatim(cleanQuery: string): Promise<PlaceSearchResult[]> {
  try {
    const spViewbox = '-46.85,-23.35,-46.35,-23.75';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cleanQuery
    )}&format=json&addressdetails=1&limit=6&countrycodes=br&viewbox=${spViewbox}`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any, idx: number) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const rawType = item.type || item.category || '';
      const rawName = item.name || item.display_name.split(',')[0].trim();
      const addr = item.address || {};
      const road = addr.road || addr.pedestrian || addr.street || '';
      const houseNumber = addr.house_number ? `, ${addr.house_number}` : '';
      const suburb = addr.suburb || addr.neighbourhood || addr.city_district || 'São Paulo';
      const city = addr.city || addr.town || 'São Paulo';

      let formattedAddress = item.display_name;
      if (road) {
        formattedAddress = `${road}${houseNumber} - ${suburb}, ${city} - SP`;
      }

      const category = inferPlaceCategory(rawType, rawName, formattedAddress);
      const nearestMetro = findNearestMetroStation(lat, lng);

      return {
        id: `nom-${item.place_id || idx}`,
        name: rawName,
        formattedAddress,
        lat,
        lng,
        neighborhood: suburb,
        category,
        rawType,
        metroStation: nearestMetro?.station,
        metroLine: nearestMetro?.line,
        source: 'osm' as const,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Main Hybrid Search Function:
 * 1. Checks in-memory cache
 * 2. If Google Maps API Key is active, uses Google Places API
 * 3. Uses Photon (fast OSM geocoding with CORS)
 * 4. Falls back to Nominatim if needed
 */
export async function searchPlacesOnline(query: string): Promise<PlaceSearchResult[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  const cacheKey = cleanQuery.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  // 1. Try Google Places if key exists
  const gmapsKey = getGoogleMapsApiKey();
  if (gmapsKey) {
    const googleResults = await searchWithGooglePlaces(cleanQuery, gmapsKey);
    if (googleResults.length > 0) {
      searchCache.set(cacheKey, googleResults);
      return googleResults;
    }
  }

  // 2. Photon search (Fast, CORS enabled, Biased to São Paulo)
  const photonResults = await searchWithPhoton(cleanQuery);
  if (photonResults.length > 0) {
    searchCache.set(cacheKey, photonResults);
    return photonResults;
  }

  // 3. Fallback to Nominatim
  const nomResults = await searchWithNominatim(cleanQuery);
  if (nomResults.length > 0) {
    searchCache.set(cacheKey, nomResults);
    return nomResults;
  }

  return [];
}
