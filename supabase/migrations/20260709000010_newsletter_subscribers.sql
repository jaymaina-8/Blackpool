-- 20260709000010_newsletter_subscribers.sql

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    email text NOT NULL UNIQUE,
    status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source text DEFAULT 'blog',
    created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can subscribe)
CREATE POLICY "Enable insert for anonymous users" 
ON public.newsletter_subscribers 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users (admin) to view/update
CREATE POLICY "Enable read for authenticated users" 
ON public.newsletter_subscribers 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable update for authenticated users" 
ON public.newsletter_subscribers 
FOR UPDATE 
TO authenticated 
USING (true);
