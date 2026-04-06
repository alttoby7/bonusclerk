import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load central .env
config({ path: resolve(process.env.HOME ?? '', 'google-drive/0-AI/.env') });
config({ path: resolve(__dirname, '../.env') });

const url = process.env.BONUSCLERK_SUPABASE_URL;
const serviceKey = process.env.BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing BONUSCLERK_SUPABASE_URL or BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

// ---- Import existing data ----

// Banks
import { banks } from '../src/data/banks/index.js';
// Bonuses
import { chaseBonuses } from '../src/data/bonuses/chase.js';
import { wellsFargoBonuses } from '../src/data/bonuses/wells-fargo.js';
import { capitalOneBonuses } from '../src/data/bonuses/capital-one.js';
import { citiBonuses } from '../src/data/bonuses/citi.js';
import { sofiBonuses } from '../src/data/bonuses/sofi.js';
import { hysaBonuses } from '../src/data/bonuses/hysa.js';
// Pillars
import { pillars } from '../src/data/pillars.js';
// Method guides
import { methodGuides } from '../src/data/direct-deposit/method-guides.js';

const PROJECT_ROOT = resolve(__dirname, '..');

const allBonuses = [
  ...chaseBonuses,
  ...wellsFargoBonuses,
  ...capitalOneBonuses,
  ...citiBonuses,
  ...sofiBonuses,
  ...hysaBonuses,
];

function loadJson(relativePath: string) {
  return JSON.parse(readFileSync(resolve(PROJECT_ROOT, relativePath), 'utf-8'));
}

async function seedBanks() {
  const rows = banks.map(b => ({
    slug: b.slug,
    name: b.name,
    short_name: b.shortName ?? null,
    logo_url: b.logoUrl ?? null,
    website: b.website,
    is_fdic_insured: b.isFDICInsured,
    is_nationwide: b.isNationwide,
    description: b.description,
  }));

  const { error } = await supabase.from('banks').upsert(rows, { onConflict: 'slug' });
  if (error) throw new Error(`banks: ${error.message}`);
  console.log(`  banks: ${rows.length} rows`);
}

async function seedBonuses() {
  const rows = allBonuses.map(b => ({
    id: b.id,
    bank_slug: b.bankSlug,
    account_type: b.accountType,
    bonus_amount: b.bonusAmount,
    bonus_description: b.bonusDescription,
    requirements: b.requirements,
    monthly_fee: b.fees.monthly,
    fee_waivable: b.fees.waivable,
    fee_waive_condition: b.fees.waiveCondition ?? null,
    apy: b.apy ?? null,
    expiration_date: b.expirationDate ?? null,
    time_to_bonus: b.timeToBonus,
    keep_open_months: b.keepOpenMonths,
    availability: Array.isArray(b.availability) ? b.availability.join(',') : b.availability,
    is_active: b.isActive,
    last_verified: b.lastVerified,
    affiliate_url: b.affiliateUrl ?? null,
    tags: b.tags,
    apr_basis_type: b.aprBasis?.type ?? null,
    apr_qualifying_amount: b.aprBasis?.qualifyingAmount ?? null,
    apr_hold_days: b.aprBasis?.holdDays ?? null,
    screening_chex_sensitive: b.screening?.chexSensitive ?? null,
    screening_agencies: b.screening?.agencies ?? [],
    opening_method: b.openingMethod ?? null,
  }));

  const { error } = await supabase.from('bonuses').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`bonuses: ${error.message}`);
  console.log(`  bonuses: ${rows.length} rows`);
}

async function seedPillars() {
  const rows = pillars.map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    icon: p.icon,
    clusters: p.clusters,
  }));

  const { error } = await supabase.from('pillars').upsert(rows, { onConflict: 'slug' });
  if (error) throw new Error(`pillars: ${error.message}`);
  console.log(`  pillars: ${rows.length} rows`);
}

async function seedInstitutions() {
  const institutions = loadJson('src/data/direct-deposit/institutions.json');
  const rows = institutions.map((i: any) => ({
    slug: i.slug,
    name: i.name,
    short_name: i.shortName ?? null,
    type: i.type,
    is_tracked_bank: i.isTrackedBank,
  }));

  const { error } = await supabase.from('dd_institutions').upsert(rows, { onConflict: 'slug' });
  if (error) throw new Error(`dd_institutions: ${error.message}`);
  console.log(`  dd_institutions: ${rows.length} rows`);
}

async function seedAliases() {
  const aliases = loadJson('src/data/direct-deposit/aliases.json');
  const rows: { alias: string; institution_slug: string }[] = [];

  for (const [alias, slug] of Object.entries(aliases)) {
    rows.push({ alias: alias.toLowerCase(), institution_slug: slug as string });
  }

  const { error } = await supabase.from('dd_aliases').upsert(rows, { onConflict: 'alias' });
  if (error) throw new Error(`dd_aliases: ${error.message}`);
  console.log(`  dd_aliases: ${rows.length} rows`);
}

async function seedMethodGuides() {
  const rows = methodGuides.map(g => ({
    type: g.type,
    title: g.title,
    steps: g.steps,
    processing_time: g.processingTime,
    tips: g.tips,
    warnings: g.warnings,
  }));

  const { error } = await supabase.from('dd_method_guides').upsert(rows, { onConflict: 'type' });
  if (error) throw new Error(`dd_method_guides: ${error.message}`);
  console.log(`  dd_method_guides: ${rows.length} rows`);
}

async function seedEvidence() {
  const evidence = loadJson('src/data/direct-deposit/evidence.json');
  const rows = evidence.map((e: any) => ({
    legacy_id: e.id,
    source_institution_slug: e.sourceInstitutionSlug,
    source_label: e.sourceLabel ?? '',
    destination_bank_slug: e.destinationBankSlug,
    outcome: e.outcome,
    observed_on: e.observedOn ?? null,
    reported_on: e.reportedOn,
    date_precision: e.datePrecision,
    source_type: e.sourceType,
    source_url: e.sourceUrl ?? null,
    extract_confidence: e.extractConfidence,
    review_status: e.reviewStatus,
    notes: e.notes ?? null,
  }));

  // Batch in groups of 100
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase.from('dd_evidence').upsert(batch, { onConflict: 'legacy_id' });
    if (error) throw new Error(`dd_evidence batch ${i}: ${error.message}`);
  }
  console.log(`  dd_evidence: ${rows.length} rows`);
}

async function main() {
  console.log('Seeding BonusClerk Supabase...\n');

  // Order matters: banks first (FK target)
  await seedBanks();
  await seedBonuses();
  await seedPillars();
  await seedInstitutions();
  await seedMethodGuides();
  await seedAliases();
  await seedEvidence();

  console.log('\nDone! All data seeded.');
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
