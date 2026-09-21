import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from env or localStorage
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const localUrl = localStorage.getItem('sampatrip_supabase_url') || '';
  const localKey = localStorage.getItem('sampatrip_supabase_key') || '';

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
    localStorage.setItem('sampatrip_supabase_url', url.trim());
    localStorage.setItem('sampatrip_supabase_key', anonKey.trim());
  } else {
    localStorage.removeItem('sampatrip_supabase_url');
    localStorage.removeItem('sampatrip_supabase_key');
  }
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
