import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { EVIDENCE_PATH, OUTPUT_DIR } from './config.js';
import type { DDEvidenceEntry, RawExtraction } from './types.js';
import { resolveSlug, getInstitutionName } from './alias-matcher.js';
import { isDuplicate } from './dedup.js';

function getNextId(existing: DDEvidenceEntry[]): number {
  let max = 0;
  for (const e of existing) {
    const num = parseInt(e.id.replace('e', ''), 10);
    if (num > max) max = num;
  }
  return max + 1;
}

function mapSourceType(platform: RawExtraction['sourcePlatform'], isFromMasterList: boolean): string {
  if (platform === 'doctor_of_credit' && isFromMasterList) return 'doctor_of_credit';
  return 'linked_public_report';
}

export interface MergeResult {
  newEntries: DDEvidenceEntry[];
  duplicatesSkipped: number;
  unmatchedNames: { raw: string; context: string; url: string }[];
}

export function processExtractions(extractions: RawExtraction[]): MergeResult {
  const existing: DDEvidenceEntry[] = JSON.parse(readFileSync(EVIDENCE_PATH, 'utf-8'));
  let nextId = getNextId(existing);
  const newEntries: DDEvidenceEntry[] = [];
  let duplicatesSkipped = 0;
  const unmatchedNames: { raw: string; context: string; url: string }[] = [];

  for (const ext of extractions) {
    // Resolve slugs
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

    const isMasterList = ext.sourceUrl.includes('knowledge-base') || ext.sourceUrl.includes('list-methods');

    const entry: DDEvidenceEntry = {
      id: `e${nextId}`,
      sourceInstitutionSlug: sourceMatch.slug!,
      sourceLabel: getInstitutionName(sourceMatch.slug!),
      destinationBankSlug: destMatch.slug!,
      outcome: ext.outcome as 'counts' | 'does_not_count',
      observedOn: ext.observedDate,
      reportedOn: ext.extractedAt.slice(0, 10),
      datePrecision: ext.datePrecision,
      sourceType: mapSourceType(ext.sourcePlatform, isMasterList),
      sourceUrl: ext.sourceUrl,
      extractConfidence: Math.round(ext.extractConfidence * 100) / 100,
      reviewStatus: 'pending',
      notes: ext.notes || undefined,
    };

    // Dedup against existing + already-added new entries
    if (isDuplicate(entry, [...existing, ...newEntries])) {
      duplicatesSkipped++;
      continue;
    }

    newEntries.push(entry);
    nextId++;
  }

  return { newEntries, duplicatesSkipped, unmatchedNames };
}

export function writeResults(result: MergeResult, dryRun: boolean): void {
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
    console.log('\nDRY RUN — evidence.json not modified');
    return;
  }

  if (result.newEntries.length === 0) {
    console.log('\nNo new entries to merge');
    return;
  }

  // Merge into evidence.json
  const existing: DDEvidenceEntry[] = JSON.parse(readFileSync(EVIDENCE_PATH, 'utf-8'));
  const merged = [...existing, ...result.newEntries];
  writeFileSync(EVIDENCE_PATH, JSON.stringify(merged, null, 2));
  console.log(`\nMerged ${result.newEntries.length} new entries into evidence.json (total: ${merged.length})`);
}
