-- 20260709000006_storage_buckets.sql

-- Insert the 'media' bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880, -- 5MB limit at the bucket level
  '{"image/jpeg","image/png","image/webp","image/gif","image/svg+xml"}'
)
on conflict (id) do update set 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = '{"image/jpeg","image/png","image/webp","image/gif","image/svg+xml"}';



-- Public read access
create policy "Media files are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'media' );

-- Authenticated upload access (Author, Editor, Admin, Owner)
create policy "Authors can upload media files"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor', 'author'))
  );

-- Authenticated update access
create policy "Authors can update media files"
  on storage.objects for update
  using (
    bucket_id = 'media'
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor', 'author'))
  );

-- Authenticated delete access
create policy "Authors can delete media files"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'administrator', 'editor', 'author'))
  );
