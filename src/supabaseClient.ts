import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Expect environment variables to be defined in an .env(.local) file at project root
// Vite exposes variables prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
	supabase = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
	// eslint-disable-next-line no-console
	console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth will be disabled. Set VITE_DISABLE_AUTH=1 to silence this.');
}

export { supabase };
