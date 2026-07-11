-- 20260709000012_marketing_conversion.sql

-- 1. Marketing Campaigns
create table if not exists public.marketing_campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  status text default 'draft'::text not null, -- 'draft', 'active', 'ended'
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  banner_enabled boolean default false,
  banner_text text,
  banner_url text,
  banner_color text default 'primary',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Marketing CTAs
create table if not exists public.marketing_ctas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text,
  description text,
  primary_button_text text,
  primary_button_url text,
  secondary_button_text text,
  secondary_button_url text,
  type text default 'default', -- 'default', 'split', 'minimal'
  placement text default 'any', -- 'homepage', 'blog', 'sidebar', 'footer', 'any'
  icon text,
  background_style text default 'dark', -- 'dark', 'light', 'primary', 'gradient'
  priority integer default 0,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  status text default 'active'::text not null, -- 'active', 'inactive'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Lead Magnets
create table if not exists public.lead_magnets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  image_url text,
  file_url text not null,
  category text,
  email_required boolean default true,
  thank_you_message text default 'Thank you for downloading! Your file should download automatically.',
  status text default 'active'::text not null,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Lead Downloads (Capture)
create table if not exists public.lead_downloads (
  id uuid default gen_random_uuid() primary key,
  magnet_id uuid references public.lead_magnets(id) on delete cascade not null,
  email text not null,
  name text,
  source text,
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Marketing Events (Analytics)
create table if not exists public.marketing_events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null, -- e.g., 'cta_click', 'magnet_download', 'newsletter_signup'
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_ctas enable row level security;
alter table public.lead_magnets enable row level security;
alter table public.lead_downloads enable row level security;
alter table public.marketing_events enable row level security;

-- Policies for marketing_campaigns
create policy "Marketing campaigns are viewable by everyone if active"
  on public.marketing_campaigns for select
  using (status = 'active');

create policy "Admins have full access to campaigns"
  on public.marketing_campaigns for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );

-- Policies for marketing_ctas
create policy "Marketing CTAs are viewable by everyone if active"
  on public.marketing_ctas for select
  using (status = 'active');

create policy "Admins have full access to ctas"
  on public.marketing_ctas for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );

-- Policies for lead_magnets
create policy "Lead magnets are viewable by everyone if active"
  on public.lead_magnets for select
  using (status = 'active');

create policy "Admins have full access to lead magnets"
  on public.lead_magnets for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );

-- Policies for lead_downloads (Anonymous can insert, Admins can read)
create policy "Anyone can insert lead downloads"
  on public.lead_downloads for insert
  with check (true);

create policy "Admins can view lead downloads"
  on public.lead_downloads for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );

-- Policies for marketing_events (Anonymous can insert, Admins can read)
create policy "Anyone can insert marketing events"
  on public.marketing_events for insert
  with check (true);

create policy "Admins can view marketing events"
  on public.marketing_events for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );
