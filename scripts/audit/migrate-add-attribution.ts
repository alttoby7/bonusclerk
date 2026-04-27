import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
config({ path: resolve(process.env.HOME ?? '', 'google-drive/0-AI/.env') });

const SQL = `
ALTER TABLE dd_evidence
  ADD COLUMN IF NOT EXISTS reddit_username text,
  ADD COLUMN IF NOT EXISTS reddit_subreddit text;
`;

async function main() {
  const url = process.env.BONUSCLERK_SUPABASE_URL!;
  const key = process.env.BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key);
  const { error } = await sb.rpc('exec_sql' as any, { sql: SQL });
  if (error) {
    console.error('rpc exec_sql failed (may not exist), trying direct REST:', error.message);
    process.exit(2);
  }
  console.log('Migration applied');
}
main().catch(e => { console.error(e); process.exit(1); });
