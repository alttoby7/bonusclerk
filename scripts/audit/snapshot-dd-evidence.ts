import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
config({ path: resolve(process.env.HOME ?? '', 'google-drive/0-AI/.env') });

async function main() {
  const url = process.env.BONUSCLERK_SUPABASE_URL!;
  const key = process.env.BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key);
  const { data, error } = await sb.from('dd_evidence').select('*');
  if (error) throw error;
  const stamp = new Date().toISOString().slice(0, 10);
  const path = resolve(process.cwd(), `scripts/audit/backups/dd_evidence.supabase.${stamp}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`Snapshotted ${data?.length} rows → ${path}`);
}
main().catch(e => { console.error(e); process.exit(1); });
