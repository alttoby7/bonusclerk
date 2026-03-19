import * as cheerio from 'cheerio';
import { DOC_RATE_LIMIT_MS, DD_KEYWORDS, USER_AGENT, sleep } from '../config.js';
import type { RawComment } from '../types.js';

// Known DoC DD master list URL
const DOC_DD_LIST_URL = 'https://www.doctorofcredit.com/knowledge-base/list-methods-banks-count-direct-deposits/';

// Known bank bonus post URLs (current active bonuses)
const BONUS_POST_URLS: Record<string, string> = {
  chase: 'https://www.doctorofcredit.com/chase-checking-300-savings-200-bonus/',
  'wells-fargo': 'https://www.doctorofcredit.com/wells-fargo-325-checking-bonus-available-online/',
  'capital-one': 'https://www.doctorofcredit.com/capital-one-250-checking-bonus-direct-deposit-not-required-2/',
  citi: 'https://www.doctorofcredit.com/citi-300-checking-bonus/',
  sofi: 'https://www.doctorofcredit.com/sofi-checking-5000-direct-deposit-required/',
};

async function fetchPage(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!resp.ok) {
      console.warn(`  HTTP ${resp.status} fetching ${url}`);
      return null;
    }
    return await resp.text();
  } catch (err) {
    console.warn(`  Fetch error for ${url}:`, (err as Error).message);
    return null;
  }
}

// More targeted keywords for comments (avoid false positives from general bonus discussion)
const COMMENT_DD_KEYWORDS = [
  'direct deposit', 'ach push', 'ach transfer',
  'triggered dd', 'counted as dd', 'posted as dd',
  'coded as direct', 'count as direct',
  'did not count', 'didn\'t count', 'does not count',
  'doesn\'t count', 'didn\'t trigger', 'did not trigger',
  'fidelity', 'schwab', 'vanguard', 'ally', 'wealthfront',
  'betterment', 'e*trade', 'etrade', 'robinhood',
  'paypal', 'venmo', 'zelle', 'cash app',
];

function containsDDKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return DD_KEYWORDS.some(kw => lower.includes(kw));
}

function containsCommentDDKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return COMMENT_DD_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Scrape the DoC master DD list page.
 * The page has structured content: bank headings followed by lists of what counts/doesn't.
 * We split into per-bank sections for Claude to extract from.
 */
export async function scrapeMasterList(): Promise<RawComment[]> {
  console.log('Fetching DoC DD master list...');
  const html = await fetchPage(DOC_DD_LIST_URL);
  if (!html) return [];

  const $ = cheerio.load(html);
  const comments: RawComment[] = [];

  // The master list page has content in the article body
  const articleBody = $('.entry-content, .post-content, article .entry-content').first();
  if (!articleBody.length) {
    console.warn('  Could not find article body');
    // Fallback: try the whole page
    const bodyText = $('body').text();
    console.log(`  Falling back to body text (${bodyText.length} chars)`);
  }

  // Strategy: find all h2/h3 headings that look like bank names,
  // then collect all content until the next heading.
  // Each section is a bank's DD data.
  const sections: { heading: string; content: string }[] = [];
  let currentHeading = '';
  let currentContent = '';

  // Walk through ALL elements in the article body, recursively
  const walkChildren = (parent: cheerio.Cheerio<cheerio.Element>) => {
    parent.children().each((_, el) => {
      const tag = (el as cheerio.Element).tagName?.toLowerCase();
      const text = $(el).text().trim();

      if (tag === 'h2' || tag === 'h3') {
        // Save previous section
        if (currentHeading && currentContent.length > 20) {
          sections.push({ heading: currentHeading, content: currentContent.trim() });
        }
        currentHeading = text;
        currentContent = '';
      } else if (text && currentHeading) {
        // Accumulate content under current heading
        currentContent += text + '\n';
      }
    });
  };

  walkChildren(articleBody);
  // Don't forget the last section
  if (currentHeading && currentContent.length > 20) {
    sections.push({ heading: currentHeading, content: currentContent.trim() });
  }

  console.log(`  Found ${sections.length} bank sections from master list`);

  // Each section becomes a comment for Claude extraction
  for (const section of sections) {
    // Prefix with the bank name heading for context
    const text = `Bank: ${section.heading}\n${section.content}`;
    comments.push({
      text: text.slice(0, 3000), // Allow longer chunks for master list
      url: DOC_DD_LIST_URL,
      platform: 'doctor_of_credit',
      postedOn: null,
    });
  }

  return comments;
}

/**
 * Scrape comments from DoC bank bonus posts.
 * Try WP REST API first, fall back to HTML comment parsing.
 */
export async function scrapeBonusPostComments(limit?: number): Promise<RawComment[]> {
  const allComments: RawComment[] = [];
  const urls = Object.entries(BONUS_POST_URLS);
  const toScrape = limit ? urls.slice(0, limit) : urls;

  for (const [bankSlug, postUrl] of toScrape) {
    console.log(`Fetching comments for ${bankSlug}...`);
    const html = await fetchPage(postUrl);
    if (!html) {
      await sleep(DOC_RATE_LIMIT_MS);
      continue;
    }

    const $ = cheerio.load(html);

    // Try to find WordPress post ID for REST API
    const postId = $('article').attr('id')?.replace('post-', '') ??
                   $('body').attr('class')?.match(/postid-(\d+)/)?.[1];

    let commentTexts: { text: string; date: string | null }[] = [];

    if (postId) {
      // Try WP REST API for comments
      const apiComments = await fetchWPComments(postUrl, postId);
      if (apiComments.length > 0) {
        commentTexts = apiComments;
      }
    }

    // Fall back to HTML parsing if REST API didn't work
    if (commentTexts.length === 0) {
      commentTexts = parseHTMLComments($);
    }

    // Filter to DD-relevant comments (use stricter keywords for comments)
    const ddComments = commentTexts.filter(c => containsCommentDDKeyword(c.text));
    console.log(`  ${ddComments.length} DD-relevant comments (of ${commentTexts.length} total) for ${bankSlug}`);

    for (const c of ddComments) {
      allComments.push({
        text: c.text.slice(0, 1000),
        url: postUrl,
        platform: 'doctor_of_credit',
        postedOn: c.date,
      });
    }

    await sleep(DOC_RATE_LIMIT_MS);
  }

  return allComments;
}

async function fetchWPComments(
  baseUrl: string,
  postId: string
): Promise<{ text: string; date: string | null }[]> {
  const origin = new URL(baseUrl).origin;
  const apiUrl = `${origin}/wp-json/wp/v2/comments?post=${postId}&per_page=100&orderby=date&order=desc`;

  try {
    const resp = await fetch(apiUrl, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!resp.ok) return [];

    const data = await resp.json();
    if (!Array.isArray(data)) return [];

    return data.map((c: { content?: { rendered?: string }; date?: string }) => ({
      text: cheerio.load(c.content?.rendered ?? '').text().trim(),
      date: c.date?.slice(0, 10) ?? null,
    })).filter((c: { text: string }) => c.text.length > 10);
  } catch {
    return [];
  }
}

function parseHTMLComments($: cheerio.CheerioAPI): { text: string; date: string | null }[] {
  const results: { text: string; date: string | null }[] = [];

  // Try multiple WordPress comment selectors
  const commentSelectors = [
    '.comment-body',
    'li.comment',
    '.comment-content',
    '#comments .comment',
    '.commentlist li',
  ];

  for (const selector of commentSelectors) {
    if (results.length > 0) break;

    $(selector).each((_, el) => {
      // Get the comment text, trying various inner selectors
      let text = '';
      const contentEl = $(el).find('.comment-content, .comment-text, p');
      if (contentEl.length) {
        text = contentEl.text().trim();
      } else {
        text = $(el).text().trim();
      }

      const dateEl = $(el).find('time, .comment-date, .comment-metadata a');
      const dateStr = dateEl.attr('datetime')?.slice(0, 10) ?? null;

      if (text.length > 20) {
        results.push({ text: text.slice(0, 1500), date: dateStr });
      }
    });
  }

  return results;
}

export async function scrapeDoctorofCredit(limit?: number): Promise<RawComment[]> {
  const masterComments = await scrapeMasterList();
  await sleep(DOC_RATE_LIMIT_MS);
  const bonusComments = await scrapeBonusPostComments(limit);
  return [...masterComments, ...bonusComments];
}
