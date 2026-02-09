import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables or use provided credentials directly
// We prioritize environment variables, but fallback to the hardcoded keys provided.
const supabaseUrl = process.env.SUPABASE_URL || 'https://vaeztsqydhvelqjcfhfm.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_UB6XVN0cn3-j0c9KNm9DDA_OeajfXyT';

// Helper to check if Supabase is actually usable
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseKey && supabaseKey !== 'placeholder';
};

// Initialize the client with the provided credentials
export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);