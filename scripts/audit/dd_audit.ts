import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
config({ path: resolve(process.env.HOME ?? '', 'google-drive/0-AI/.env') });

async function main() {
  const url = process.env.BONUSCLERK_SUPABASE_URL!;
  const key = process.env.BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key);
  const { data, error } = await sb.from('dd_evidence').select('legacy_id, source_url, source_type, review_status');
  if (error) { console.error(error); process.exit(1); }
  console.log(`Total rows: ${data?.length}`);
  let doc = 0, reddit = 0, none = 0, other = 0;
  for (const r of data ?? []) {
    if (!r.source_url) { none++; continue; }
    if (r.source_url.includes('doctorofcredit.com')) doc++;
    else if (r.source_url.includes('reddit.com')) reddit++;
    else other++;
  }
  console.log(`DoC URLs: ${doc}`);
  console.log(`Reddit URLs: ${reddit}`);
  console.log(`No URL: ${none}`);
  console.log(`Other: ${other}`);
  const types: Record<string, number> = {};
  for (const r of data ?? []) types[r.source_type] = (types[r.source_type] ?? 0) + 1;
  console.log(`By source_type:`, types);
  const statuses: Record<string, number> = {};
  for (const r of data ?? []) statuses[r.review_status] = (statuses[r.review_status] ?? 0) + 1;
  console.log(`By review_status:`, statuses);
}
main();
