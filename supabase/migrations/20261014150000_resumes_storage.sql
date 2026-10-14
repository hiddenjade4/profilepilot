-- ProfilePilot — migration 2: resume uploads
--
-- How to apply: Supabase dashboard → SQL Editor → New query → paste this
-- whole file → Run. Run it once.
--
-- Creates a PRIVATE storage bucket for resume files and a table that tracks
-- each user's resume. Each user can only touch files inside a folder named
-- after their own user id, e.g. resumes/<user-id>/<random-id>.pdf.

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false, -- private: files are never reachable by a public URL
  4194304, -- 4 MB, matching the app's limit (Vercel caps uploads at 4.5 MB)
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- storage.foldername(name) splits "user-id/file.pdf" into its folders, so
-- [1] is the top-level folder, which must equal the signed-in user's id.
create policy "Users can read their own resume files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload resume files to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own resume files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- No update policy: a resume is replaced by uploading a new file and
-- deleting the old one, never edited in place.

-- ---------------------------------------------------------------------------
-- resumes table: one current resume per user
-- ---------------------------------------------------------------------------
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  -- unique: each user has at most one resume; uploading again replaces it.
  user_id uuid not null unique references auth.users (id) on delete cascade,
  -- Where the file lives in the bucket. Uses random ids, never the original
  -- filename, so names can't collide or carry odd characters.
  storage_path text not null unique
    check (char_length(storage_path) <= 200),
  -- Shown to the user only. Never used to build file paths.
  original_filename text not null
    check (char_length(original_filename) between 1 and 255),
  mime_type text not null check (mime_type in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 4194304),
  -- Phase 3 moves this through processing → processed (or failed).
  status text not null default 'uploaded'
    check (status in ('uploaded', 'processing', 'processed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The file must live inside the owner's folder.
  check (storage_path like user_id::text || '/%')
);

comment on table public.resumes is 'Metadata for each user''s uploaded resume. The file itself is in the private "resumes" storage bucket.';

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

alter table public.resumes enable row level security;

create policy "Users can view their own resume"
  on public.resumes for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own resume"
  on public.resumes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can replace their own resume"
  on public.resumes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own resume"
  on public.resumes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.resumes from anon, authenticated;
grant select, insert, delete on public.resumes to authenticated;
-- Replacing a resume rewrites these columns; id, user_id, and timestamps
-- can't be changed by the user.
grant update (storage_path, original_filename, mime_type, size_bytes, status)
  on public.resumes to authenticated;
