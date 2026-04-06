-- BonusClerk: Full schema migration
-- Run via Supabase SQL Editor or supabase db push

-- Enums
create type bonus_account_type as enum ('checking','savings','money-market','cd','business');
create type dd_institution_type as enum ('bank','brokerage','fintech','p2p','payroll','government','other');
create type dd_outcome as enum ('counts','does_not_count');
create type dd_date_precision as enum ('exact','month','year','unknown');
create type dd_source_type as enum ('community_report','staff_manual','linked_public_report','trusted_user','new_user','anonymous');
create type dd_review_status as enum ('approved','pending','rejected');
create type bonus_apr_basis_type as enum ('locked-capital','direct-deposit','activity','none');
create type opening_method as enum ('online','in-person','both');

-- Banks (14 rows)
create table banks (
  slug text primary key,
  name text not null,
  short_name text,
  logo_url text,
  website text not null,
  is_fdic_insured boolean not null default true,
  is_nationwide boolean not null default true,
  description text not null default ''
);

-- Bonuses (~15 rows)
create table bonuses (
  id text primary key,
  bank_slug text not null references banks(slug) on update cascade,
  account_type bonus_account_type not null,
  bonus_amount integer not null default 0 check (bonus_amount >= 0),
  bonus_description text not null default '',
  requirements jsonb not null default '{}'::jsonb,
  monthly_fee integer not null default 0 check (monthly_fee >= 0),
  fee_waivable boolean not null default false,
  fee_waive_condition text,
  apy numeric(6,3),
  expiration_date date,
  time_to_bonus text not null default '',
  keep_open_months integer not null default 0 check (keep_open_months >= 0),
  availability text not null default 'nationwide',
  is_active boolean not null default true,
  last_verified date not null default current_date,
  affiliate_url text,
  tags text[] not null default '{}',
  apr_basis_type bonus_apr_basis_type,
  apr_qualifying_amount integer,
  apr_hold_days integer,
  screening_chex_sensitive boolean,
  screening_agencies text[] not null default '{}',
  opening_method opening_method
);

-- Pillars (7 rows)
create table pillars (
  slug text primary key,
  title text not null,
  description text not null default '',
  icon text not null default '',
  clusters text[] not null default '{}'
);

-- DD Institutions (30 rows)
create table dd_institutions (
  slug text primary key,
  name text not null,
  short_name text,
  type dd_institution_type not null,
  is_tracked_bank boolean not null default false
);

-- DD Aliases (62 rows)
create table dd_aliases (
  alias text primary key check (alias = lower(alias)),
  institution_slug text not null references dd_institutions(slug) on update cascade
);

-- DD Method Guides (4 rows)
create table dd_method_guides (
  type dd_institution_type primary key,
  title text not null,
  steps text[] not null default '{}',
  processing_time text not null default '',
  tips text[] not null default '{}',
  warnings text[] not null default '{}'
);

-- DD Evidence (294+ rows, growing)
create table dd_evidence (
  id bigint generated always as identity primary key,
  legacy_id text unique,
  source_institution_slug text not null references dd_institutions(slug),
  source_label text not null default '',
  destination_bank_slug text not null references banks(slug),
  outcome dd_outcome not null,
  observed_on date,
  reported_on date not null default current_date,
  date_precision dd_date_precision not null default 'unknown',
  source_type dd_source_type not null default 'community_report',
  source_url text,
  extract_confidence numeric(4,3) not null default 0.5 check (extract_confidence >= 0 and extract_confidence <= 1),
  review_status dd_review_status not null default 'pending',
  notes text,
  effective_on date generated always as (coalesce(observed_on, reported_on)) stored
);

-- Indexes
create index bonuses_bank_idx on bonuses(bank_slug);
create index bonuses_active_idx on bonuses(is_active, expiration_date);
create index bonuses_tags_gin on bonuses using gin(tags);

create index dd_evidence_dest_idx on dd_evidence(destination_bank_slug, review_status, effective_on desc);
create index dd_evidence_source_idx on dd_evidence(source_institution_slug, review_status, effective_on desc);
create index dd_evidence_pair_idx on dd_evidence(source_institution_slug, destination_bank_slug, review_status);
create index dd_aliases_institution_idx on dd_aliases(institution_slug);

-- RLS: Enable on all tables, anon = read-only
alter table banks enable row level security;
alter table bonuses enable row level security;
alter table pillars enable row level security;
alter table dd_institutions enable row level security;
alter table dd_aliases enable row level security;
alter table dd_method_guides enable row level security;
alter table dd_evidence enable row level security;

create policy "anon_read_banks" on banks for select to anon using (true);
create policy "anon_read_bonuses" on bonuses for select to anon using (true);
create policy "anon_read_pillars" on pillars for select to anon using (true);
create policy "anon_read_dd_institutions" on dd_institutions for select to anon using (true);
create policy "anon_read_dd_aliases" on dd_aliases for select to anon using (true);
create policy "anon_read_dd_method_guides" on dd_method_guides for select to anon using (true);
create policy "anon_read_dd_evidence" on dd_evidence for select to anon using (true);

-- Service role bypasses RLS automatically
