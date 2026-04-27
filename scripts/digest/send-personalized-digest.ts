/**
 * Personalized weekly bonus digest sender.
 *
 * For each active subscriber, finds bonuses they qualify for based on:
 *   - bank not already held
 *   - bonus amount >= their min threshold
 *   - DD-required bonuses: at least one of their push sources has
 *     a `likely-works` verdict for that bank in the DD checker
 *
 * Skips bonuses already sent to that subscriber. Records sends in
 * bonus_alert_sent for idempotency.
 *
 * Usage:
 *   npx tsx scripts/digest/send-personalized-digest.ts          # send for real
 *   npx tsx scripts/digest/send-personalized-digest.ts --dry    # log what would send
 *   npx tsx scripts/digest/send-personalized-digest.ts --user=email@x.com
 *
 * Listmonk wiring:
 *   Set BONUSCLERK_LISTMONK_URL, BONUSCLERK_LISTMONK_API_USER,
 *   BONUSCLERK_LISTMONK_API_TOKEN, BONUSCLERK_LISTMONK_TX_TEMPLATE_ID
 *   in central .env. Without these, runs in dry-mode automatically.
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
config({ path: resolve(process.env.HOME ?? '', 'google-drive/0-AI/.env') });

interface Subscriber {
  id: string;
  email: string;
  held_bank_slugs: string[];
  source_institution_slugs: string[];
  min_bonus_amount: number;
  unsubscribe_token: string;
}

interface BonusRow {
  id: string;
  bank_slug: string;
  bonus_amount: number;
  bonus_description: string;
  is_active: boolean;
  expiration_date: string | null;
  affiliate_url: string | null;
  requirements: { directDeposit?: { amount: number; frequency: string } } | null;
}

interface BankRow {
  slug: string;
  name: string;
}

interface EvidenceRow {
  source_institution_slug: string;
  destination_bank_slug: string;
  outcome: 'counts' | 'does_not_count';
  review_status: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const userArg = args.find(a => a.startsWith('--user='));
  const userFilter = userArg?.split('=')[1];
  return { dry, userFilter };
}

async function listmonkSendOrSkip(
  payload: { email: string; subject: string; html: string },
  dry: boolean
): Promise<{ sent: boolean; reason?: string }> {
  const url = process.env.BONUSCLERK_LISTMONK_URL;
  const user = process.env.BONUSCLERK_LISTMONK_API_USER;
  const token = process.env.BONUSCLERK_LISTMONK_API_TOKEN;

  if (dry) return { sent: false, reason: 'dry-run' };
  if (!url || !user || !token) {
    return { sent: false, reason: 'listmonk-not-configured' };
  }

  // Listmonk transactional send via direct HTTP (no template, raw body)
  const res = await fetch(`${url.replace(/\/$/, '')}/api/tx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${user}:${token}`).toString('base64')}`,
    },
    body: JSON.stringify({
      subscriber_email: payload.email,
      template_id: Number(process.env.BONUSCLERK_LISTMONK_TX_TEMPLATE_ID ?? 0),
      data: { subject: payload.subject, html: payload.html },
      content_type: 'html',
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    return { sent: false, reason: `listmonk ${res.status}: ${txt.slice(0, 200)}` };
  }
  return { sent: true };
}

function renderDigestHtml(opts: {
  bonuses: BonusRow[];
  bankNames: Map<string, string>;
  unsubscribeUrl: string;
}): string {
  const items = opts.bonuses.map(b => {
    const cta = b.affiliate_url ?? `https://bonusclerk.com/bonuses`;
    const expiry = b.expiration_date
      ? `<br><span style="color:#94a3b8;font-size:12px">Expires ${new Date(b.expiration_date).toLocaleDateString('en-US')}</span>`
      : '';
    const bankName = opts.bankNames.get(b.bank_slug) ?? b.bank_slug;
    return `
      <tr>
        <td style="padding:16px;border-bottom:1px solid #e2e8f0">
          <div style="font-size:18px;font-weight:600;color:#0f172a">$${b.bonus_amount.toLocaleString()} — ${bankName}</div>
          <div style="margin-top:6px;color:#475569;font-size:14px">${b.bonus_description}</div>
          <div style="margin-top:10px"><a href="${cta}" style="color:#2563eb">View bonus →</a>${expiry}</div>
        </td>
      </tr>`;
  }).join('');

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
    <table width="100%" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden">
      <tr><td style="padding:24px 16px;border-bottom:1px solid #e2e8f0">
        <div style="font-size:20px;font-weight:700;color:#0f172a">BonusClerk</div>
        <div style="margin-top:4px;color:#475569;font-size:14px">Bonuses matched to your accounts</div>
      </td></tr>
      ${items}
      <tr><td style="padding:16px;color:#94a3b8;font-size:12px;text-align:center">
        <a href="${opts.unsubscribeUrl}" style="color:#94a3b8">Unsubscribe</a> ·
        <a href="https://bonusclerk.com/alerts/setup" style="color:#94a3b8">Update preferences</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

async function main() {
  const { dry, userFilter } = parseArgs();
  const url = process.env.BONUSCLERK_SUPABASE_URL!;
  const key = process.env.BONUSCLERK_SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key);

  let q = sb.from('bonus_alert_subscribers').select('*').eq('status', 'active');
  if (userFilter) q = q.eq('email', userFilter);
  const { data: subs, error: subErr } = await q;
  if (subErr) throw subErr;
  console.log(`Loaded ${subs?.length ?? 0} active subscriber(s)${dry ? ' [DRY RUN]' : ''}`);

  const { data: bonuses, error: bErr } = await sb
    .from('bonuses')
    .select('id, bank_slug, bonus_amount, bonus_description, is_active, expiration_date, affiliate_url, requirements')
    .eq('is_active', true);
  if (bErr) throw bErr;

  const { data: banks } = await sb.from('banks').select('slug, name');
  const bankNames = new Map<string, string>();
  for (const b of (banks ?? []) as BankRow[]) bankNames.set(b.slug, b.name);

  // Build "likely works" map from approved evidence:
  // a (source, dest) pair is "compatible" if there's at least 1 approved
  // counts entry AND no does_not_count entries (simple heuristic).
  const { data: evidence } = await sb
    .from('dd_evidence')
    .select('source_institution_slug, destination_bank_slug, outcome, review_status')
    .eq('review_status', 'approved');

  const pairCounts = new Map<string, { yes: number; no: number }>();
  for (const e of (evidence ?? []) as EvidenceRow[]) {
    const k = `${e.source_institution_slug}->${e.destination_bank_slug}`;
    const c = pairCounts.get(k) ?? { yes: 0, no: 0 };
    if (e.outcome === 'counts') c.yes++; else c.no++;
    pairCounts.set(k, c);
  }
  const likelyWorksMap = new Map<string, Set<string>>(); // dest → set of sources
  for (const [k, c] of pairCounts) {
    if (c.yes >= 1 && c.no === 0) {
      const [src, dest] = k.split('->');
      if (!likelyWorksMap.has(dest)) likelyWorksMap.set(dest, new Set());
      likelyWorksMap.get(dest)!.add(src);
    }
  }

  let totalMatches = 0;
  let totalSent = 0;
  let totalSkipped = 0;

  for (const sub of (subs ?? []) as Subscriber[]) {
    const held = new Set(sub.held_bank_slugs ?? []);
    const sources = new Set(sub.source_institution_slugs ?? []);

    const candidates = ((bonuses ?? []) as BonusRow[]).filter(b => {
      if (held.has(b.bank_slug)) return false;
      if (b.bonus_amount < sub.min_bonus_amount) return false;
      const ddRequired = b.requirements?.directDeposit?.amount && b.requirements.directDeposit.amount > 0;
      if (ddRequired) {
        const compatible = likelyWorksMap.get(b.bank_slug);
        if (!compatible) return false;
        const overlap = [...sources].some(s => compatible.has(s));
        if (!overlap) return false;
      }
      return true;
    });

    if (candidates.length === 0) continue;

    // Filter out bonuses already sent
    const { data: alreadySent } = await sb
      .from('bonus_alert_sent')
      .select('bonus_id')
      .eq('subscriber_id', sub.id);
    const sentSet = new Set((alreadySent ?? []).map(r => r.bonus_id));
    const fresh = candidates.filter(b => !sentSet.has(b.id));
    if (fresh.length === 0) continue;

    totalMatches += fresh.length;
    const unsubscribeUrl = `https://bonusclerk.com/api/alerts/unsubscribe?token=${sub.unsubscribe_token}`;
    const html = renderDigestHtml({ bonuses: fresh, bankNames, unsubscribeUrl });
    const firstBankName = bankNames.get(fresh[0].bank_slug) ?? fresh[0].bank_slug;
    const subject = fresh.length === 1
      ? `New bonus matches your accounts: $${fresh[0].bonus_amount} at ${firstBankName}`
      : `${fresh.length} new bonuses match your accounts`;

    const result = await listmonkSendOrSkip({ email: sub.email, subject, html }, dry);

    if (result.sent) {
      const insertRows = fresh.map(b => ({ subscriber_id: sub.id, bonus_id: b.id }));
      await sb.from('bonus_alert_sent').insert(insertRows);
      await sb.from('bonus_alert_subscribers')
        .update({ last_alerted_at: new Date().toISOString() })
        .eq('id', sub.id);
      totalSent++;
      console.log(`  ✓ Sent ${fresh.length} match(es) to ${sub.email}`);
    } else {
      totalSkipped++;
      console.log(`  ○ ${sub.email}: ${fresh.length} match(es) — ${result.reason}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total matches: ${totalMatches}`);
  console.log(`Sent: ${totalSent}`);
  console.log(`Skipped: ${totalSkipped}`);
}

main().catch(e => { console.error(e); process.exit(1); });
