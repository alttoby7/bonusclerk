import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'DD Checker Methodology | BonusClerk',
  description: 'How BonusClerk sources, scores, and attributes direct deposit compatibility data points. Every entry links to its original public source.',
};

export default function MethodologyPage() {
  return (
    <Container size="narrow" className="py-10">
      <h1 className="text-3xl font-extrabold text-text-primary">DD Checker Methodology</h1>
      <p className="mt-2 text-text-secondary">How we source, score, and attribute every data point.</p>

      <div className="prose mt-8">
        <h2>Where the data comes from</h2>
        <p>
          Every direct-deposit data point in our checker is sourced from a public Reddit thread
          — primarily the weekly Data Points threads in{' '}
          <a href="https://www.reddit.com/r/churning/" rel="noopener noreferrer">r/churning</a>{' '}
          and{' '}
          <a href="https://www.reddit.com/r/bankbonuses/" rel="noopener noreferrer">r/bankbonuses</a>.
          We do not aggregate from Doctor of Credit, Dannydealguru, or any other curated database.
          The original commenter and thread URL are stored with every entry and shown in the UI.
        </p>

        <h2>What you can verify</h2>
        <ul>
          <li>Click any evidence row → opens the original Reddit comment</li>
          <li>The Reddit username who reported it is shown</li>
          <li>The subreddit and date the comment was posted are stored</li>
          <li>If a data point is removed from Reddit, our entry remains but you can confirm it&apos;s gone</li>
        </ul>

        <h2>What we don&apos;t do</h2>
        <ul>
          <li>
            <strong>We don&apos;t pretend to verify these ourselves.</strong> Every entry is a
            community-reported data point, not a tested transaction. Treat them as evidence,
            not guarantees.
          </li>
          <li>
            <strong>We don&apos;t scrape from Doctor of Credit.</strong> DoC has spent over a decade
            curating community data. Rebuilding their work without attribution wouldn&apos;t be
            ethical. They have their own DD list — go read it directly if you want their data.
          </li>
          <li>
            <strong>We don&apos;t hide our limitations.</strong> Our dataset is smaller than DoC&apos;s
            because we only include data we can attribute. Smaller and verifiable beats larger
            and anonymous.
          </li>
        </ul>

        <h2>Confidence scoring</h2>
        <p>
          Each pair (source institution → destination bank) gets a confidence score based on:
        </p>
        <ul>
          <li>
            <strong>Recency.</strong> Exponential decay with a 365-day half-life. A data point
            from last month weighs more than one from two years ago.
          </li>
          <li>
            <strong>Source quality.</strong> Community reports from established usernames carry
            more weight than first-comment accounts.
          </li>
          <li>
            <strong>Evidence clustering.</strong> Multiple independent reports of the same outcome
            increase confidence; the same person reporting twice does not.
          </li>
          <li>
            <strong>Conflict guard.</strong> If a recent report (last 90 days) contradicts older
            evidence, confidence is capped — banks change their DD criteria over time.
          </li>
          <li>
            <strong>Verdict thresholds.</strong> &ldquo;Likely works&rdquo; requires a meaningful
            evidence weight AND multiple independent reporters. We say &ldquo;not enough data&rdquo;
            instead of guessing.
          </li>
        </ul>

        <h2>Why we rebuilt the dataset</h2>
        <p>
          An earlier version of this tool included data scraped from Doctor of Credit without
          source attribution. We removed all of that data on April 26, 2026 and rebuilt from
          scratch using only public Reddit threads with full attribution. This means our
          coverage is currently smaller than it was — we&apos;d rather grow honestly than scale
          on someone else&apos;s work.
        </p>

        <h2>How the dataset grows</h2>
        <ul>
          <li>
            <strong>Weekly Reddit scrape.</strong> Our scraper runs on a schedule and pulls new
            data points from r/churning and r/bankbonuses Data Points threads.
          </li>
          <li>
            <strong>User submissions (coming soon).</strong> A submission form will let users
            report their own DD outcomes. Each submission will require an account, a screenshot,
            and will be visible publicly with the submitter&apos;s display name.
          </li>
          <li>
            <strong>Backfill.</strong> We periodically walk older threads to fill gaps in
            historical coverage.
          </li>
        </ul>

        <h2>Found a bad entry?</h2>
        <p>
          If you spot a data point that looks wrong, conflicts with your experience, or where
          our scraper misinterpreted the comment — let us know. Email{' '}
          <a href="mailto:hello@bonusclerk.com">hello@bonusclerk.com</a> with the entry ID
          (visible on each evidence row) and we&apos;ll review it.
        </p>

        <p className="mt-10 text-sm text-text-tertiary">
          Last updated: April 26, 2026. See also:{' '}
          <Link href="/dd-checker">DD Checker</Link>,{' '}
          <Link href="/about">About BonusClerk</Link>.
        </p>
      </div>
    </Container>
  );
}
