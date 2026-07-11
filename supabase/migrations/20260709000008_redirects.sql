-- 20260709000008_redirects.sql

-- Create redirects table
CREATE TABLE IF NOT EXISTS public.redirects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    old_slug citext NOT NULL UNIQUE,
    new_slug citext NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Public can read redirects
CREATE POLICY "Public can view redirects" 
ON public.redirects FOR SELECT 
USING (true);

-- Authenticated admins can manage redirects
CREATE POLICY "Admins can manage redirects" 
ON public.redirects FOR ALL 
TO authenticated 
USING (true);
