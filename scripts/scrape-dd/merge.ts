import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { OUTPUT_DIR } from './config.js';
import type { DDEvidenceEntry, RawExtraction } from './types.js';
import { resolveSlug, getInstitutionName } from './alias-matcher.js';
import { isDuplicate } from './dedup.js';

// Load env for Supabase credentials
config({ path: resolve(process.env.HOME ?? '', 'google-drive/0-AI/.env') });

function getServiceClient() {
  const url = process.env.BONUSCLERK_SUPABASE_URL;
  const key = process.env.BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing BONUSCLERK_SUPABASE_URL or BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key);
}

function mapSourceType(platform: RawExtraction['sourcePlatform']): string {
  if (platform === 'reddit') return 'reddit_data_point';
  return 'linked_public_report';
}

export interface MergeResult {
  newEntries: DDEvidenceEntry[];
  duplicatesSkipped: number;
  unmatchedNames: { raw: string; context: string; url: string }[];
}

export async function processExtractions(extractions: RawExtraction[]): Promise<MergeResult> {
  const supabase = getServiceClient();

  // Fetch existing evidence from DB for dedup
  const { data: existingRows, error } = await supabase
    .from('dd_evidence')
    .select('legacy_id, source_institution_slug, destination_bank_slug, outcome, observed_on, reported_on, source_url');

  if (error) throw new Error(`Failed to fetch existing evidence: ${error.message}`);

  // Convert to DDEvidenceEntry shape for dedup
  const existing: DDEvidenceEntry[] = (existingRows ?? []).map((r: any) => ({
    id: r.legacy_id ?? '',
    sourceInstitutionSlug: r.source_institution_slug,
    sourceLabel: '',
    destinationBankSlug: r.destination_bank_slug,
    outcome: r.outcome,
    observedOn: r.observed_on,
    reportedOn: r.reported_on,
    datePrecision: 'unknown' as const,
    sourceType: 'community_report' as const,
    sourceUrl: r.source_url,
    extractConfidence: 0,
    reviewStatus: 'approved' as const,
  }));

  // Get next legacy_id number
  let nextId = 1;
  for (const e of existing) {
    if (e.id) {
      const num = parseInt(e.id.replace('e', ''), 10);
      if (num > nextId) nextId = num;
    }
  }
  nextId++;

  const newEntries: DDEvidenceEntry[] = [];
  let duplicatesSkipped = 0;
  const unmatchedNames: { raw: string; context: string; url: string }[] = [];

  for (const ext of extractions) {
    const sourceMatch = resolveSlug(ext.sourceInstitution);
    const destMatch = resolveSlug(ext.destinationBank);

    if (sourceMatch.matchType === 'unmatched') {
      unmatchedNames.push({
        raw: ext.sourceInstitution,
        context: `source in: "${ext.sourceText.slice(0, 100)}"`,
        url: ext.sourceUrl,
      });
      continue;
    }
    if (destMatch.matchType === 'unmatched') {
      unmatchedNames.push({
        raw: ext.destinationBank,
        context: `destination in: "${ext.sourceText.slice(0, 100)}"`,
        url: ext.sourceUrl,
      });
      continue;
    }

    const entry: DDEvidenceEntry = {
      id: `e${nextId}`,
      sourceInstitutionSlug: sourceMatch.slug!,
      sourceLabel: getInstitutionName(sourceMatch.slug!),
      destinationBankSlug: destMatch.slug!,
      outcome: ext.outcome as 'counts' | 'does_not_count',
      observedOn: ext.observedDate,
      reportedOn: ext.extractedAt.slice(0, 10),
      datePrecision: ext.datePrecision,
      sourceType: mapSourceType(ext.sourcePlatform),
      sourceUrl: ext.sourceUrl,
      redditUsername: ext.redditUsername,
      redditSubreddit: ext.redditSubreddit,
      extractConfidence: Math.round(ext.extractConfidence * 100) / 100,
      reviewStatus: 'pending',
      notes: ext.notes || undefined,
    };

    if (isDuplicate(entry, [...existing, ...newEntries])) {
      duplicatesSkipped++;
      continue;
    }

    newEntries.push(entry);
    nextId++;
  }

  return { newEntries, duplicatesSkipped, unmatchedNames };
}

export async function writeResults(result: MergeResult, dryRun: boolean): Promise<void> {
  // Ensure output dir exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write run log
  const dateStr = new Date().toISOString().slice(0, 10);
  const logPath = `${OUTPUT_DIR}/run-${dateStr}.json`;
  writeFileSync(logPath, JSON.stringify({
    runDate: new Date().toISOString(),
    dryRun,
    newEntries: result.newEntries.length,
    duplicatesSkipped: result.duplicatesSkipped,
    unmatchedNames: result.unmatchedNames.length,
    entries: result.newEntries,
  }, null, 2));
  console.log(`Run log written to ${logPath}`);

  // Write unmatched names
  if (result.unmatchedNames.length > 0) {
    const unmatchedPath = `${OUTPUT_DIR}/unmatched.json`;
    writeFileSync(unmatchedPath, JSON.stringify(result.unmatchedNames, null, 2));
    console.log(`Unmatched names written to ${unmatchedPath}`);
  }

  if (dryRun) {
    console.log('\nDRY RUN — database not modified');
    return;
  }

  if (result.newEntries.length === 0) {
    console.log('\nNo new entries to merge');
    return;
  }

  // Postgres `date` type requires YYYY-MM-DD. Normalize partial-precision values:
  //   "YYYY"     → "YYYY-01-01"
  //   "YYYY-MM"  → "YYYY-MM-01"
  //   anything else passes through (already YYYY-MM-DD or null/undefined)
  function normalizeDate(d: string | null | undefined): string | null {
    if (!d) return null;
    if (/^\d{4}$/.test(d)) return `${d}-01-01`;
    if (/^\d{4}-\d{2}$/.test(d)) return `${d}-01`;
    return d;
  }

  // Insert into Supabase
  const supabase = getServiceClient();

  // FK constraint: destination_bank_slug must exist in banks table.
  // Brokerages/fintechs are valid SOURCES but not DESTINATIONS.
  const { data: validBanks } = await supabase.from('banks').select('slug');
  const bankSlugs = new Set((validBanks ?? []).map((b: any) => b.slug));
  const filtered = result.newEntries.filter(e => bankSlugs.has(e.destinationBankSlug));
  const rejected = result.newEntries.length - filtered.length;
  if (rejected > 0) {
    console.log(`Filtered ${rejected} entries with non-bank destination slugs`);
  }
  const rows = filtered.map(e => ({
    legacy_id: e.id,
    source_institution_slug: e.sourceInstitutionSlug,
    source_label: e.sourceLabel,
    destination_bank_slug: e.destinationBankSlug,
    outcome: e.outcome,
    observed_on: normalizeDate(e.observedOn),
    reported_on: normalizeDate(e.reportedOn) ?? new Date().toISOString().slice(0, 10),
    date_precision: e.datePrecision,
    source_type: e.sourceType,
    source_url: e.sourceUrl ?? null,
    reddit_username: e.redditUsername ?? null,
    reddit_subreddit: e.redditSubreddit ?? null,
    extract_confidence: e.extractConfidence,
    review_status: e.reviewStatus,
    notes: e.notes ?? null,
  }));

  // Batch in groups of 100
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from('dd_evidence').insert(batch);
    if (error) throw new Error(`Failed to insert evidence batch ${i}: ${error.message}`);
  }

  console.log(`\nInserted ${rows.length} new entries into Supabase dd_evidence`);
}
