-- 20260709000013_marketing_enhancements.sql

-- 1. Marketing Settings Table (Global configuration)
create table if not exists public.marketing_settings (
  id integer primary key default 1 check (id = 1), -- Single row table
  company_name text default 'Blackpool Industry',
  primary_cta text,
  sales_email text,
  sales_phone text,
  whatsapp text,
  facebook text,
  linkedin text,
  youtube text,
  instagram text,
  x_twitter text,
  copyright text default '© Blackpool Industry. All rights reserved.',
  footer_cta text,
  default_author text default 'Blackpool Industry Team',
  
  -- Feature Flags
  enable_cta boolean default true,
  enable_banner boolean default true,
  enable_newsletter boolean default true,
  enable_lead_magnets boolean default true,
  enable_exit_popup boolean default false,
  enable_ab_testing boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed marketing settings
insert into public.marketing_settings (id) values (1) on conflict do nothing;

alter table public.marketing_settings enable row level security;

create policy "Marketing settings are viewable by everyone"
  on public.marketing_settings for select
  using (true);

create policy "Admins have full access to marketing settings"
  on public.marketing_settings for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('administrator', 'editor')
    )
  );

-- 2. Enhance marketing_ctas
alter table public.marketing_ctas 
  add column if not exists target_category text,
  add column if not exists target_tag text,
  add column if not exists device text default 'all', -- 'all', 'mobile', 'desktop'
  add column if not exists variant text default 'A', -- For A/B Testing ('A', 'B')
  add column if not exists weight integer default 100; -- Traffic distribution (e.g., 50 for 50%)

-- 3. Enhance marketing_campaigns
alter table public.marketing_campaigns
  add column if not exists timezone text default 'UTC',
  add column if not exists is_recurring boolean default false,
  add column if not exists recurring_pattern text; -- e.g., 'yearly', 'monthly'

-- 4. Enhance lead_magnets
alter table public.lead_magnets
  add column if not exists version integer default 1;
