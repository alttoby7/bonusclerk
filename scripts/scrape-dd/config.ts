import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Rate limits (ms between requests)
export const DOC_RATE_LIMIT_MS = 2000;
export const REDDIT_RATE_LIMIT_MS = 1200;

// Extraction
export const EXTRACTION_BATCH_SIZE = 10;
export const MIN_CONFIDENCE_THRESHOLD = 0.5;

// Dedup
export const DEDUP_DATE_WINDOW_DAYS = 30;

// Paths
export const PROJECT_ROOT = resolve(__dirname, '../..');
export const EVIDENCE_PATH = resolve(PROJECT_ROOT, 'src/data/direct-deposit/evidence.json');
export const ALIASES_PATH = resolve(PROJECT_ROOT, 'src/data/direct-deposit/aliases.json');
export const INSTITUTIONS_PATH = resolve(PROJECT_ROOT, 'src/data/direct-deposit/institutions.json');
export const OUTPUT_DIR = resolve(__dirname, 'output');

// User agent for fetches
export const USER_AGENT = 'BonusClerk-DDScraper/1.0 (research; contact@bonusclerk.com)';

// DD-related keywords for filtering comments
export const DD_KEYWORDS = [
  'direct deposit', 'dd', 'ach', 'push', 'transfer',
  'triggered', 'counted', 'posted as', 'coded as',
  'did not count', 'didn\'t count', 'does not count',
  'doesn\'t count', 'worked', 'failed',
];

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
