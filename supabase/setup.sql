create table if not exists public.kitchen_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  recipes jsonb not null default '[]'::jsonb,
  wishlist jsonb not null default '[]'::jsonb,
  inventory jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.kitchen_data enable row level security;

drop policy if exists "Read own kitchen" on public.kitchen_data;
create policy "Read own kitchen"
on public.kitchen_data
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Create own kitchen" on public.kitchen_data;
create policy "Create own kitchen"
on public.kitchen_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Update own kitchen" on public.kitchen_data;
create policy "Update own kitchen"
on public.kitchen_data
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Delete own kitchen" on public.kitchen_data;
create policy "Delete own kitchen"
on public.kitchen_data
for delete
to authenticated
using ((select auth.uid()) = user_id);
