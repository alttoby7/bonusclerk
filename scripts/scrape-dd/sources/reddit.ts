import { REDDIT_RATE_LIMIT_MS, DD_KEYWORDS, USER_AGENT, sleep } from '../config.js';
import type { RawComment } from '../types.js';

const CHURNING_BASE = 'https://www.reddit.com/r/churning/search.json?q=flair%3A%22Data+Points%22&sort=new&restrict_sr=1&limit=100';
const BANKBONUSES_BASE = 'https://www.reddit.com/r/bankbonuses/search.json?q=direct+deposit+OR+DD+OR+ACH&sort=new&restrict_sr=1&limit=100';
// Max search pages to walk per subreddit (each page = up to 100 threads).
// Reddit search caps at ~250-1000 results total, so 4-10 pages is sufficient.
const MAX_SEARCH_PAGES = 5;

interface RedditListing {
  data: {
    after?: string | null;
    children: Array<{
      kind?: string;
      data: {
        id: string;
        name?: string;
        title: string;
        permalink: string;
        selftext?: string;
        created_utc: number;
        subreddit?: string;
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
    author?: string;
    subreddit?: string;
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

interface FlatComment {
  text: string;
  date: string | null;
  permalink: string;
  author: string | null;
  subreddit: string | null;
}

function flattenComments(nodes: RedditCommentNode[], fallbackSubreddit: string | null): FlatComment[] {
  const results: FlatComment[] = [];

  for (const node of nodes) {
    if (node.kind !== 't1' || !node.data.body) continue;

    const text = node.data.body.trim();
    if (text.length > 10) {
      const date = node.data.created_utc
        ? new Date(node.data.created_utc * 1000).toISOString().slice(0, 10)
        : null;
      const author = node.data.author && node.data.author !== '[deleted]' ? node.data.author : null;
      const subreddit = node.data.subreddit ?? fallbackSubreddit;
      results.push({
        text,
        date,
        permalink: node.data.permalink
          ? `https://www.reddit.com${node.data.permalink}`
          : '',
        author,
        subreddit,
      });
    }

    if (node.data.replies && typeof node.data.replies === 'object') {
      const children = node.data.replies.data?.children;
      if (children) {
        results.push(...flattenComments(children as RedditCommentNode[], fallbackSubreddit));
      }
    }
  }

  return results;
}

async function scrapeThreadComments(permalink: string, threadSubreddit: string | null): Promise<RawComment[]> {
  const jsonUrl = `https://www.reddit.com${permalink}.json?limit=200`;
  const data = await fetchJSON<RedditListing[]>(jsonUrl);
  if (!data || !Array.isArray(data) || data.length < 2) return [];

  const commentListing = data[1];
  const allComments = flattenComments(commentListing.data.children as RedditCommentNode[], threadSubreddit);

  return allComments
    .filter(c => containsDDKeyword(c.text))
    .map(c => ({
      text: c.text.slice(0, 1000),
      url: c.permalink || `https://www.reddit.com${permalink}`,
      platform: 'reddit' as const,
      postedOn: c.date,
      redditUsername: c.author ?? undefined,
      redditSubreddit: c.subreddit ?? undefined,
    }));
}

async function collectThreads(baseUrl: string, maxThreads: number): Promise<RedditListing['data']['children']> {
  const all: RedditListing['data']['children'] = [];
  let after: string | null | undefined = null;

  for (let page = 0; page < MAX_SEARCH_PAGES; page++) {
    const url = after ? `${baseUrl}&after=${after}` : baseUrl;
    const listing = await fetchJSON<RedditListing>(url);
    await sleep(REDDIT_RATE_LIMIT_MS);
    if (!listing) break;

    const children = listing.data.children;
    if (!children || children.length === 0) break;

    all.push(...children);
    if (all.length >= maxThreads) break;

    after = listing.data.after;
    if (!after) break;
  }

  return all.slice(0, maxThreads);
}

export async function scrapeReddit(limit?: number): Promise<RawComment[]> {
  console.log('Fetching r/churning + r/bankbonuses Data Points threads (paginated)...');
  const allComments: RawComment[] = [];

  // Default cap when no --limit passed: walk up to 200 threads per subreddit.
  // With --limit N: cap total threads per subreddit at N.
  const perSubCap = limit ?? 200;

  for (const baseUrl of [CHURNING_BASE, BANKBONUSES_BASE]) {
    const threads = await collectThreads(baseUrl, perSubCap);
    console.log(`  Collected ${threads.length} threads from ${baseUrl.includes('churning') ? 'r/churning' : 'r/bankbonuses'}`);

    for (const thread of threads) {
      const { title, permalink, subreddit } = thread.data;
      console.log(`  Scraping r/${subreddit}: ${title.slice(0, 60)}...`);

      const comments = await scrapeThreadComments(permalink, subreddit ?? null);
      console.log(`    ${comments.length} DD-relevant comments`);
      allComments.push(...comments);

      await sleep(REDDIT_RATE_LIMIT_MS);
    }
  }

  return allComments;
}
