-- إنجاز: جدول شواهد نصية تجريبية فقط، مستقل لكل حساب.
-- نفذيه مرة واحدة في Supabase > SQL Editor.
create table if not exists public.evidence_entries (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date date,
  description text not null default '',
  impact text not null default '',
  bands jsonb not null default '[]'::jsonb,
  files jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint evidence_bands_array check (jsonb_typeof(bands) = 'array'),
  constraint evidence_files_empty check (files = '[]'::jsonb)
);

create index if not exists evidence_entries_owner_date_idx
  on public.evidence_entries (user_id, created_at desc);
alter table public.evidence_entries enable row level security;

-- Replace only these app-specific policies when the SQL is re-run.
drop policy if exists "engaz_select_own" on public.evidence_entries;
drop policy if exists "engaz_insert_own" on public.evidence_entries;
drop policy if exists "engaz_update_own" on public.evidence_entries;
drop policy if exists "engaz_delete_own" on public.evidence_entries;
create policy "engaz_select_own" on public.evidence_entries
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "engaz_insert_own" on public.evidence_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "engaz_update_own" on public.evidence_entries
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "engaz_delete_own" on public.evidence_entries
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Do not create a public storage bucket. Photos are local in this trial.
