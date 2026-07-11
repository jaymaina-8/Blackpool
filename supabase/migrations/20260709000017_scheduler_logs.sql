-- 20260709000017_scheduler_logs.sql

-- 1. Scheduler Logs Table
create table if not exists public.scheduler_logs (
  id uuid default gen_random_uuid() primary key,
  run_time timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null, -- 'success', 'failed'
  articles_published integer default 0,
  duration_ms integer,
  error_message text,
  logs text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.scheduler_logs enable row level security;

-- Admin can view all scheduler logs
create policy "Admins can view scheduler_logs" on public.scheduler_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('administrator', 'editor'))
);

-- The service role will insert logs directly using the service key
