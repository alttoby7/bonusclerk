import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scrapeDoctorofCredit } from './sources/doctor-of-credit.js';
import { scrapeReddit } from './sources/reddit.js';
import { extractFromComments } from './extract.js';
import { processExtractions, writeResults } from './merge.js';
import type { RawComment } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env — central secrets location
config({ path: resolve(process.env.HOME ?? '', 'google-drive/0-AI/.env') });
// Also try project root .env
config({ path: resolve(__dirname, '../../.env') });

function parseArgs(): { source: 'doc' | 'reddit' | 'all'; dryRun: boolean; limit?: number } {
  const args = process.argv.slice(2);
  let source: 'doc' | 'reddit' | 'all' = 'all';
  let dryRun = false;
  let limit: number | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) {
      source = args[++i] as 'doc' | 'reddit' | 'all';
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10);
    }
  }

  return { source, dryRun, limit };
}

async function main() {
  const { source, dryRun, limit } = parseArgs();

  console.log(`\n=== BonusClerk DD Scraper ===`);
  console.log(`Source: ${source} | Dry run: ${dryRun}${limit ? ` | Limit: ${limit}` : ''}\n`);

  // Verify API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not found in environment. Check your .env file.');
    process.exit(1);
  }

  // Step 1: Fetch raw comments from sources
  let comments: RawComment[] = [];

  if (source === 'doc' || source === 'all') {
    const docComments = await scrapeDoctorofCredit(limit);
    console.log(`\nDoC: ${docComments.length} DD-relevant comments collected`);
    comments.push(...docComments);
  }

  if (source === 'reddit' || source === 'all') {
    const redditComments = await scrapeReddit(limit);
    console.log(`\nReddit: ${redditComments.length} DD-relevant comments collected`);
    comments.push(...redditComments);
  }

  if (comments.length === 0) {
    console.log('\nNo comments found to process. Exiting.');
    return;
  }

  console.log(`\nTotal comments to extract: ${comments.length}`);

  // Step 2: Extract structured data via Claude
  console.log('\nExtracting structured evidence via Claude Haiku...');
  const extractions = await extractFromComments(comments);
  console.log(`Extracted ${extractions.length} raw data points`);

  if (extractions.length === 0) {
    console.log('No data points extracted. Exiting.');
    return;
  }

  // Step 3: Resolve aliases, dedup, prepare entries
  console.log('\nProcessing: alias matching + dedup...');
  const result = await processExtractions(extractions);

  // Step 4: Summary
  console.log('\n=== Results ===');
  console.log(`New entries:        ${result.newEntries.length}`);
  console.log(`Duplicates skipped: ${result.duplicatesSkipped}`);
  console.log(`Unmatched names:    ${result.unmatchedNames.length}`);

  if (result.newEntries.length > 0) {
    console.log('\nNew entries preview:');
    for (const e of result.newEntries.slice(0, 10)) {
      console.log(`  ${e.sourceInstitutionSlug} → ${e.destinationBankSlug}: ${e.outcome} (confidence: ${e.extractConfidence})`);
    }
    if (result.newEntries.length > 10) {
      console.log(`  ... and ${result.newEntries.length - 10} more`);
    }
  }

  if (result.unmatchedNames.length > 0) {
    console.log('\nUnmatched names:');
    for (const u of result.unmatchedNames.slice(0, 5)) {
      console.log(`  "${u.raw}" — ${u.context}`);
    }
  }

  // Step 5: Write results
  await writeResults(result, dryRun);

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
