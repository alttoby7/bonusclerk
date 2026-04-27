import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function html(message: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>BonusClerk — Unsubscribe</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 48px 24px; color: #0f172a; }
  .card { max-width: 480px; margin: 0 auto; background: white; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: center; }
  h1 { margin: 0 0 12px; font-size: 22px; }
  p { margin: 0 0 8px; color: #475569; }
  a { color: #2563eb; }
</style></head>
<body><div class="card"><h1>BonusClerk</h1><p>${message}</p>
<p><a href="https://bonusclerk.com">Back to bonusclerk.com</a></p></div></body></html>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token || !UUID_RE.test(token)) {
    return new Response(html('Invalid unsubscribe link.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const sb = getServiceClient();
  const { data, error } = await sb
    .from('bonus_alert_subscribers')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('email')
    .maybeSingle();

  if (error || !data) {
    return new Response(html('Could not unsubscribe — link may have expired.'), {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new Response(html('You\'ve been unsubscribed. We won\'t email you again.'), {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

// Also support POST for parity
export const POST = GET;

// Avoid leaking schema in unsubscribe responses
export async function HEAD() {
  return NextResponse.json({ ok: true });
}
