import Anthropic from '@anthropic-ai/sdk';
import { EXTRACTION_BATCH_SIZE, MIN_CONFIDENCE_THRESHOLD } from './config.js';
import type { RawComment, RawExtraction } from './types.js';

const EXTRACTION_PROMPT = `You are extracting structured direct deposit (DD) compatibility data from community reports about bank bonuses.

For each comment, extract ALL distinct data points. A single comment may contain multiple.

Return ONLY a valid JSON array of objects. No markdown, no explanation. Each object:
{
  "sourceInstitution": "name of the bank/brokerage/fintech that SENT the ACH push",
  "destinationBank": "name of the bank where the bonus account is",
  "outcome": "counts" | "does_not_count" | "ambiguous",
  "observedDate": "YYYY-MM-DD" or "YYYY-MM" or null,
  "datePrecision": "exact" | "month" | "year" | "unknown",
  "extractConfidence": 0.0 to 1.0,
  "notes": "brief context from the comment"
}

RULES:
- Only extract SPECIFIC experiential data points, not questions or speculation
- "Does X work at Y?" is NOT a data point — skip it
- "X worked at Y" / "X triggered DD at Y" / "X posted as DD at Y" IS a data point
- "X did not count" / "X failed" / "X didn't trigger DD" → outcome: "does_not_count"
- Skip entries where your confidence is below 0.5
- If outcome is truly unclear, use "ambiguous" — these will be filtered out later
- For dates: extract whatever precision is given. "January 2026" → "2026-01", "1/15/26" → "2026-01-15"
- sourceInstitution = the sending side (Fidelity, Schwab, Ally, etc.)
- destinationBank = the receiving side where the bonus is (Chase, Wells Fargo, etc.)

If a comment contains NO extractable data points, return an empty array: []`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export async function extractFromComments(
  comments: RawComment[]
): Promise<RawExtraction[]> {
  const allExtractions: RawExtraction[] = [];

  // Process in batches
  for (let i = 0; i < comments.length; i += EXTRACTION_BATCH_SIZE) {
    const batch = comments.slice(i, i + EXTRACTION_BATCH_SIZE);
    const batchExtractions = await extractBatch(batch);
    allExtractions.push(...batchExtractions);

    if (i + EXTRACTION_BATCH_SIZE < comments.length) {
      console.log(`  Extracted batch ${Math.floor(i / EXTRACTION_BATCH_SIZE) + 1}/${Math.ceil(comments.length / EXTRACTION_BATCH_SIZE)}`);
    }
  }

  return allExtractions;
}

async function extractBatch(comments: RawComment[]): Promise<RawExtraction[]> {
  const numberedComments = comments
    .map((c, i) => `[Comment ${i + 1}] (from: ${c.url})\n${c.text}`)
    .join('\n\n---\n\n');

  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `${EXTRACTION_PROMPT}\n\nHere are the comments to extract from:\n\n${numberedComments}`,
      },
    ],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  let parsed: Array<{
    sourceInstitution: string;
    destinationBank: string;
    outcome: string;
    observedDate: string | null;
    datePrecision: string;
    extractConfidence: number;
    notes: string;
  }>;

  try {
    // Handle case where Claude wraps in markdown code block
    let jsonStr = text.replace(/^```json?\s*\n?/, '').replace(/\n?\s*```$/, '').trim();
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to repair truncated JSON array — find the last complete object
      const lastBrace = jsonStr.lastIndexOf('}');
      if (lastBrace > 0) {
        jsonStr = jsonStr.slice(0, lastBrace + 1) + ']';
        parsed = JSON.parse(jsonStr);
        console.log('  (repaired truncated JSON)');
      } else {
        throw new Error('Cannot repair JSON');
      }
    }
  } catch {
    console.warn('  Failed to parse extraction response, skipping batch');
    console.warn('  Response:', text.slice(0, 300));
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const now = new Date().toISOString();
  const results: RawExtraction[] = [];

  for (const item of parsed) {
    if (!item.sourceInstitution || !item.destinationBank || !item.outcome) continue;
    if (item.extractConfidence < MIN_CONFIDENCE_THRESHOLD) continue;
    if (item.outcome === 'ambiguous') continue;

    // Try to find which comment this came from (best effort)
    const matchingComment = comments.find(c =>
      c.text.toLowerCase().includes(item.sourceInstitution.toLowerCase().slice(0, 6))
    ) ?? comments[0];

    results.push({
      sourceText: matchingComment.text.slice(0, 500),
      sourceUrl: matchingComment.url,
      sourcePlatform: matchingComment.platform,
      extractedAt: now,
      sourceInstitution: item.sourceInstitution,
      destinationBank: item.destinationBank,
      outcome: item.outcome as 'counts' | 'does_not_count',
      observedDate: item.observedDate ?? null,
      datePrecision: (item.datePrecision as RawExtraction['datePrecision']) ?? 'unknown',
      extractConfidence: item.extractConfidence,
      notes: item.notes ?? '',
    });
  }

  return results;
}
