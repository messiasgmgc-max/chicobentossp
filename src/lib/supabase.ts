import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Storage keys (supports both for backward compatibility)
const STORAGE_URL_KEY = 'chicobentossp_supabase_url';
const STORAGE_ANON_KEY = 'chicobentossp_supabase_key';

// Auto-detect config from URL hash or query params on load (?sb_url=...&sb_key=...)
if (typeof window !== 'undefined') {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    
    const urlParam = searchParams.get('sb_url') || hashParams.get('sb_url');
    const keyParam = searchParams.get('sb_key') || hashParams.get('sb_key');

    if (urlParam && keyParam) {
      localStorage.setItem(STORAGE_URL_KEY, urlParam.trim());
      localStorage.setItem(STORAGE_ANON_KEY, keyParam.trim());
      // Clean query/hash parameters without page reload
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch {
    // Ignore URL parsing errors
  }
}

// Get credentials from env, localStorage or query
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  
  const localUrl = (
    localStorage.getItem(STORAGE_URL_KEY) ||
    localStorage.getItem('sampatrip_supabase_url') ||
    ''
  ).trim();
  
  const localKey = (
    localStorage.getItem(STORAGE_ANON_KEY) ||
    localStorage.getItem('sampatrip_supabase_key') ||
    ''
  ).trim();

  const url = localUrl || envUrl;
  const anonKey = localKey || envKey;

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    // Keep legacy key synced too
    localStorage.setItem('sampatrip_supabase_url', url.trim());
    localStorage.setItem('sampatrip_supabase_key', anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
    localStorage.removeItem('sampatrip_supabase_url');
    localStorage.removeItem('sampatrip_supabase_key');
  }
}

export function getSyncShareUrl(): string {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured || typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}#sb_url=${encodeURIComponent(url)}&sb_key=${encodeURIComponent(anonKey)}`;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export interface SupabaseHealthCheck {
  connected: boolean;
  hasTripsTable: boolean;
  hasLogisticsColumns: boolean;
  hasTripMembers: boolean;
  hasPlaces: boolean;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthCheck> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      connected: false,
      hasTripsTable: false,
      hasLogisticsColumns: false,
      hasTripMembers: false,
      hasPlaces: false,
      error: 'Supabase não configurado. Adicione a URL e a Anon Key.',
    };
  }

  try {
    const { error: tripErr } = await supabase
      .from('trips')
      .select('id, hotel_name, arrival_airport')
      .limit(1);

    if (tripErr) {
      if (tripErr.message.includes('column') || tripErr.code === 'PGRST204' || tripErr.code === '42703') {
        return {
          connected: true,
          hasTripsTable: true,
          hasLogisticsColumns: false,
          hasTripMembers: false,
          hasPlaces: false,
          error: 'A tabela trips existe, mas faltam as colunas de logística (hotel_name, arrival_airport). Execute o SQL atualizado!',
        };
      }
      return {
        connected: false,
        hasTripsTable: false,
        hasLogisticsColumns: false,
        hasTripMembers: false,
        hasPlaces: false,
        error: tripErr.message,
      };
    }

    const { error: memberErr } = await supabase.from('trip_members').select('id').limit(1);
    const { error: placeErr } = await supabase.from('places').select('id').limit(1);

    return {
      connected: true,
      hasTripsTable: true,
      hasLogisticsColumns: true,
      hasTripMembers: !memberErr,
      hasPlaces: !placeErr,
    };
  } catch (err: any) {
    return {
      connected: false,
      hasTripsTable: false,
      hasLogisticsColumns: false,
      hasTripMembers: false,
      hasPlaces: false,
      error: err.message || 'Falha de conexão com o Supabase',
    };
  }
}

export function getGoogleMapsApiKey(): string {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const localKey = localStorage.getItem('sampatrip_google_maps_key') || '';
  return (localKey || envKey).trim();
}

export function saveGoogleMapsApiKey(key: string) {
  if (key) {
    localStorage.setItem('sampatrip_google_maps_key', key.trim());
  } else {
    localStorage.removeItem('sampatrip_google_maps_key');
  }
}
