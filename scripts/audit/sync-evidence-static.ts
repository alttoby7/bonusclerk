import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
config({ path: resolve(process.env.HOME ?? '', 'google-drive/0-AI/.env') });

async function main() {
  const url = process.env.BONUSCLERK_SUPABASE_URL!;
  const key = process.env.BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key);
  const { data, error } = await sb
    .from('dd_evidence')
    .select('legacy_id, source_institution_slug, source_label, destination_bank_slug, outcome, observed_on, reported_on, date_precision, source_type, source_url, reddit_username, reddit_subreddit, extract_confidence, review_status, notes')
    .eq('review_status', 'approved')
    .order('reported_on', { ascending: false });
  if (error) throw error;

  const entries = (data ?? []).map(r => ({
    id: r.legacy_id,
    sourceInstitutionSlug: r.source_institution_slug,
    sourceLabel: r.source_label,
    destinationBankSlug: r.destination_bank_slug,
    outcome: r.outcome,
    observedOn: r.observed_on,
    reportedOn: r.reported_on,
    datePrecision: r.date_precision,
    sourceType: r.source_type,
    ...(r.source_url ? { sourceUrl: r.source_url } : {}),
    ...(r.reddit_username ? { redditUsername: r.reddit_username } : {}),
    ...(r.reddit_subreddit ? { redditSubreddit: r.reddit_subreddit } : {}),
    extractConfidence: Number(r.extract_confidence),
    reviewStatus: r.review_status,
    ...(r.notes ? { notes: r.notes } : {}),
  }));

  const path = resolve(process.cwd(), 'src/data/direct-deposit/evidence.json');
  writeFileSync(path, JSON.stringify(entries, null, 2) + '\n');
  console.log(`Wrote ${entries.length} approved entries → ${path}`);
}
main().catch(e => { console.error(e); process.exit(1); });
