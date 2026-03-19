import { readFileSync } from 'fs';
import { ALIASES_PATH, INSTITUTIONS_PATH } from './config.js';

interface Institution {
  slug: string;
  name: string;
  shortName?: string;
  type: string;
  isTrackedBank: boolean;
}

type MatchResult =
  | { slug: string; matchType: 'exact' | 'fuzzy' }
  | { slug: null; matchType: 'unmatched' };

let aliasMap: Record<string, string> | null = null;
let institutions: Institution[] | null = null;

function loadAliases(): Record<string, string> {
  if (!aliasMap) {
    aliasMap = JSON.parse(readFileSync(ALIASES_PATH, 'utf-8'));
  }
  return aliasMap!;
}

function loadInstitutions(): Institution[] {
  if (!institutions) {
    institutions = JSON.parse(readFileSync(INSTITUTIONS_PATH, 'utf-8'));
  }
  return institutions!;
}

export function resolveSlug(rawName: string): MatchResult {
  const aliases = loadAliases();
  const insts = loadInstitutions();
  const normalized = rawName.toLowerCase().trim();

  // Tier 1: exact alias match
  if (aliases[normalized]) {
    return { slug: aliases[normalized], matchType: 'exact' };
  }

  // Also check institution slugs and names directly
  const directMatch = insts.find(
    i => i.slug === normalized ||
         i.name.toLowerCase() === normalized ||
         i.shortName?.toLowerCase() === normalized
  );
  if (directMatch) {
    return { slug: directMatch.slug, matchType: 'exact' };
  }

  // Tier 2: substring fuzzy — check if any alias is contained in the raw name
  // Sort aliases by length descending so longer matches win
  const aliasEntries = Object.entries(aliases).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, slug] of aliasEntries) {
    if (normalized.includes(alias)) {
      return { slug, matchType: 'fuzzy' };
    }
  }

  // Also check institution names as substrings
  for (const inst of insts) {
    const instName = inst.name.toLowerCase();
    const shortName = inst.shortName?.toLowerCase();
    if (normalized.includes(instName) || (shortName && normalized.includes(shortName))) {
      return { slug: inst.slug, matchType: 'fuzzy' };
    }
  }

  return { slug: null, matchType: 'unmatched' };
}

export function getInstitutionName(slug: string): string {
  const insts = loadInstitutions();
  const inst = insts.find(i => i.slug === slug);
  return inst?.shortName ?? inst?.name ?? slug;
}
