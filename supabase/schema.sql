-- AJKEYZZZ Beats Platform — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up the database

-- ─── BEATS TABLE ───
create table if not exists beats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  genre text not null default 'Alté',
  bpm integer not null default 120,
  musical_key text default '',
  typebeat text default '',
  tags text[] default '{}',
  description text default '',
  cover_color text default '#E84393',
  cover_emoji text default '🎵',
  cover_art_url text default '',
  preview_url text default '',
  full_audio_url text default '',
  stems_url text default '',
  duration integer default 180,
  price_basic numeric(10,2) default 29.99,
  price_premium numeric(10,2) default 99.99,
  price_unlimited numeric(10,2) default 149.99,
  price_exclusive numeric(10,2) default 299.99,
  featured boolean default false,
  published boolean default true,
  playlist text default '',
  plays integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── ORDERS TABLE ───
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  beat_id uuid references beats(id) on delete set null,
  customer_email text not null,
  customer_name text default '',
  license_tier text not null,
  amount numeric(10,2) not null,
  currency text default 'usd',
  stripe_session_id text default '',
  stripe_payment_intent text default '',
  download_token text unique default encode(gen_random_bytes(32), 'hex'),
  download_expires_at timestamptz default (now() + interval '72 hours'),
  fulfilled boolean default false,
  created_at timestamptz default now()
);

-- ─── INQUIRIES TABLE ───
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  inquiry_type text default 'custom_beat',
  budget text default '',
  timeline text default '',
  reference_links text default '',
  vocals_needed boolean default false,
  platform text default '',
  message text not null,
  status text default 'new',
  created_at timestamptz default now()
);

-- ─── MESSAGES TABLE (contact form) ───
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text default '',
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ─── COLLECTIONS TABLE ───
create table if not exists collections (
  id text primary key,
  name text not null,
  cover_color text default '#E84393',
  cover_emoji text default '🎵',
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── PLAY EVENTS TABLE (lightweight analytics) ───
create table if not exists play_events (
  id uuid primary key default gen_random_uuid(),
  beat_id uuid references beats(id) on delete cascade,
  created_at timestamptz default now()
);

-- ─── INDEXES ───
create index if not exists idx_beats_slug on beats(slug);
create index if not exists idx_beats_published on beats(published);
create index if not exists idx_beats_genre on beats(genre);
create index if not exists idx_beats_created_at on beats(created_at desc);
create index if not exists idx_orders_beat_id on orders(beat_id);
create index if not exists idx_orders_download_token on orders(download_token);
create index if not exists idx_inquiries_status on inquiries(status);
create index if not exists idx_play_events_beat_id on play_events(beat_id);
create index if not exists idx_collections_sort_order on collections(sort_order);

-- ─── RPC: INCREMENT PLAYS ───
create or replace function increment_plays(beat_id uuid)
returns void as $$
begin
  update beats set plays = plays + 1 where id = beat_id;
end;
$$ language plpgsql security definer;

-- ─── ROW LEVEL SECURITY ───

-- Beats: public can read published, admin can do everything
alter table beats enable row level security;
create policy "Public can read published beats" on beats
  for select using (published = true);
create policy "Admins can do everything on beats" on beats
  for all using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Orders: only admin can read
alter table orders enable row level security;
create policy "Admins can manage orders" on orders
  for all using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
-- Allow insert for checkout (service role or anon with specific conditions)
create policy "Allow order creation" on orders
  for insert with check (true);

-- Inquiries: anyone can insert, admin can read/update
alter table inquiries enable row level security;
create policy "Anyone can submit inquiry" on inquiries
  for insert with check (true);
create policy "Admins can manage inquiries" on inquiries
  for select using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
create policy "Admins can update inquiries" on inquiries
  for update using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Messages: anyone can insert, admin can read/update/delete
alter table messages enable row level security;
create policy "Anyone can submit message" on messages
  for insert with check (true);
create policy "Admins can manage messages" on messages
  for all using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Collections: public can read, admin can manage
alter table collections enable row level security;
create policy "Public can read collections" on collections
  for select using (true);
create policy "Admins can manage collections" on collections
  for all using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Play events: anyone can insert, admin can read
alter table play_events enable row level security;
create policy "Anyone can log play" on play_events
  for insert with check (true);
create policy "Admins can read play events" on play_events
  for select using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ─── STORAGE BUCKETS ───
-- Create these in the Supabase dashboard:
-- 1. "covers" (public)
-- 2. "previews" (public)
-- 3. "downloads" (private)
-- 4. "stems" (private)

-- ─── STORAGE POLICIES ───
-- Public read access for public buckets
create policy "Public read covers" on storage.objects
  for select using (bucket_id = 'covers');

create policy "Public read previews" on storage.objects
  for select using (bucket_id = 'previews');

-- Only admin users can upload/update/delete in all buckets
create policy "Admin upload" on storage.objects
  for insert with check (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Admin update" on storage.objects
  for update using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "Admin delete" on storage.objects
  for delete using (
    auth.role() = 'authenticated'
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
