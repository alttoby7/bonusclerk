import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

interface SubscribeBody {
  email?: string;
  heldBankSlugs?: string[];
  sourceInstitutionSlugs?: string[];
  minBonusAmount?: number;
  source?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeSlugArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((s): s is string => typeof s === 'string' && s.length > 0 && s.length <= 60)
    .map(s => s.trim().toLowerCase())
    .filter(s => /^[a-z0-9-]+$/.test(s))
    .slice(0, 50);
}

export async function POST(req: Request) {
  let body: SubscribeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const heldBankSlugs = sanitizeSlugArray(body.heldBankSlugs);
  const sourceInstitutionSlugs = sanitizeSlugArray(body.sourceInstitutionSlugs);
  const minBonusAmount = Math.max(0, Math.min(10000, Number(body.minBonusAmount) || 0));
  const source = typeof body.source === 'string' ? body.source.slice(0, 60) : 'alerts_setup';

  const sb = getServiceClient();

  const { data: existing } = await sb
    .from('bonus_alert_subscribers')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    const { error } = await sb
      .from('bonus_alert_subscribers')
      .update({
        held_bank_slugs: heldBankSlugs,
        source_institution_slugs: sourceInstitutionSlugs,
        min_bonus_amount: minBonusAmount,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) {
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, updated: true });
  }

  const { error } = await sb.from('bonus_alert_subscribers').insert({
    email,
    held_bank_slugs: heldBankSlugs,
    source_institution_slugs: sourceInstitutionSlugs,
    min_bonus_amount: minBonusAmount,
    source,
    status: 'active',
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, created: true });
}
