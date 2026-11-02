-- شغّلي هذا الملف مرة واحدة في SQL Editor داخل مشروعك في Supabase.
-- كل مستخدم يرى سجلاته وملفاته فقط.
create table if not exists public.evidence_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date date,
  description text not null default '',
  impact text not null default '',
  bands jsonb not null default '[]'::jsonb,
  files jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.evidence_entries enable row level security;
drop policy if exists "owner select" on public.evidence_entries;
drop policy if exists "owner insert" on public.evidence_entries;
drop policy if exists "owner update" on public.evidence_entries;
drop policy if exists "owner delete" on public.evidence_entries;
create policy "owner select" on public.evidence_entries for select to authenticated using (user_id = (select auth.uid()));
create policy "owner insert" on public.evidence_entries for insert to authenticated with check (user_id = (select auth.uid()));
create policy "owner update" on public.evidence_entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "owner delete" on public.evidence_entries for delete to authenticated using (user_id = (select auth.uid()));
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('evidence','evidence',false,10485760,ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public=false;
drop policy if exists "private evidence read" on storage.objects;
drop policy if exists "private evidence insert" on storage.objects;
drop policy if exists "private evidence delete" on storage.objects;
create policy "private evidence read" on storage.objects for select to authenticated using (bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "private evidence insert" on storage.objects for insert to authenticated with check (bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "private evidence delete" on storage.objects for delete to authenticated using (bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid())::text);
