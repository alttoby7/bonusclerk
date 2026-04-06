import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.BONUSCLERK_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.BONUSCLERK_SUPABASE_ANON_KEY ?? 'placeholder-key';

// Server-side read client (anon key — used by pages/components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client (for scraper/admin writes — bypasses RLS)
export function getServiceClient() {
  return createClient(
    supabaseUrl,
    process.env.BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key'
  );
}
