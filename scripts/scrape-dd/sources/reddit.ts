import { REDDIT_RATE_LIMIT_MS, DD_KEYWORDS, USER_AGENT, sleep } from '../config.js';
import type { RawComment } from '../types.js';

const SEARCH_URL = 'https://www.reddit.com/r/churning/search.json?q=flair%3A%22Data+Points%22&sort=new&restrict_sr=1&limit=10';
const BANKBONUSES_SEARCH = 'https://www.reddit.com/r/bankbonuses/search.json?q=direct+deposit+OR+DD+OR+ACH&sort=new&restrict_sr=1&limit=10';

interface RedditListing {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        permalink: string;
        selftext?: string;
        created_utc: number;
      };
    }>;
  };
}

interface RedditCommentNode {
  kind: string;
  data: {
    body?: string;
    created_utc?: number;
    permalink?: string;
    replies?: RedditListing | '';
  };
}

function containsDDKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return DD_KEYWORDS.some(kw => lower.includes(kw));
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!resp.ok) {
      console.warn(`  HTTP ${resp.status} fetching ${url}`);
      return null;
    }
    return await resp.json() as T;
  } catch (err) {
    console.warn(`  Fetch error for ${url}:`, (err as Error).message);
    return null;
  }
}

function flattenComments(nodes: RedditCommentNode[]): { text: string; date: string | null; permalink: string }[] {
  const results: { text: string; date: string | null; permalink: string }[] = [];

  for (const node of nodes) {
    if (node.kind !== 't1' || !node.data.body) continue;

    const text = node.data.body.trim();
    if (text.length > 10) {
      const date = node.data.created_utc
        ? new Date(node.data.created_utc * 1000).toISOString().slice(0, 10)
        : null;
      results.push({
        text,
        date,
        permalink: node.data.permalink
          ? `https://www.reddit.com${node.data.permalink}`
          : '',
      });
    }

    // Recurse into replies
    if (node.data.replies && typeof node.data.replies === 'object') {
      const children = node.data.replies.data?.children;
      if (children) {
        results.push(...flattenComments(children));
      }
    }
  }

  return results;
}

async function scrapeThreadComments(permalink: string): Promise<RawComment[]> {
  const jsonUrl = `https://www.reddit.com${permalink}.json?limit=200`;
  const data = await fetchJSON<RedditListing[]>(jsonUrl);
  if (!data || !Array.isArray(data) || data.length < 2) return [];

  const commentListing = data[1];
  const allComments = flattenComments(commentListing.data.children as RedditCommentNode[]);

  return allComments
    .filter(c => containsDDKeyword(c.text))
    .map(c => ({
      text: c.text.slice(0, 1000),
      url: c.permalink || `https://www.reddit.com${permalink}`,
      platform: 'reddit' as const,
      postedOn: c.date,
    }));
}

export async function scrapeReddit(limit?: number): Promise<RawComment[]> {
  console.log('Fetching r/churning Data Points threads...');
  const allComments: RawComment[] = [];

  // Search both r/churning and r/bankbonuses
  for (const searchUrl of [SEARCH_URL, BANKBONUSES_SEARCH]) {
    const listing = await fetchJSON<RedditListing>(searchUrl);
    if (!listing) {
      await sleep(REDDIT_RATE_LIMIT_MS);
      continue;
    }

    const threads = listing.data.children;
    const toScrape = limit ? threads.slice(0, limit) : threads;
    console.log(`  Found ${threads.length} threads, scraping ${toScrape.length}`);

    for (const thread of toScrape) {
      const { title, permalink } = thread.data;
      console.log(`  Scraping: ${title.slice(0, 60)}...`);

      const comments = await scrapeThreadComments(permalink);
      console.log(`    ${comments.length} DD-relevant comments`);
      allComments.push(...comments);

      await sleep(REDDIT_RATE_LIMIT_MS);
    }

    await sleep(REDDIT_RATE_LIMIT_MS);
  }

  return allComments;
}
