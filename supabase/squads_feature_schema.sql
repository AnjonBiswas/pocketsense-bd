create extension if not exists "pgcrypto";

create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  members uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.squad_expenses (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  paid_by uuid not null references public.profiles(id) on delete cascade,
  split_among uuid[] not null default '{}',
  split_type text not null default 'equal' check (split_type in ('equal', 'custom')),
  custom_split jsonb,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.squad_settlements (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  status text not null default 'paid' check (status in ('pending', 'paid')),
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists squads_created_by_idx on public.squads(created_by);
create index if not exists squad_expenses_squad_date_idx on public.squad_expenses(squad_id, date desc);
create index if not exists squad_settlements_squad_created_idx on public.squad_settlements(squad_id, created_at desc);

alter table public.squads enable row level security;
alter table public.squad_expenses enable row level security;
alter table public.squad_settlements enable row level security;

drop policy if exists "Users can view squads they belong to" on public.squads;
create policy "Users can view squads they belong to"
on public.squads
for select
using (auth.uid() = created_by or auth.uid() = any(members));

drop policy if exists "Users can create squads" on public.squads;
create policy "Users can create squads"
on public.squads
for insert
with check (auth.uid() = created_by);

drop policy if exists "Creators can update squads" on public.squads;
create policy "Creators can update squads"
on public.squads
for update
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

drop policy if exists "Members can view squad expenses" on public.squad_expenses;
create policy "Members can view squad expenses"
on public.squad_expenses
for select
using (
  exists (
    select 1 from public.squads
    where squads.id = squad_expenses.squad_id
      and (auth.uid() = squads.created_by or auth.uid() = any(squads.members))
  )
);

drop policy if exists "Members can add squad expenses" on public.squad_expenses;
create policy "Members can add squad expenses"
on public.squad_expenses
for insert
with check (
  exists (
    select 1 from public.squads
    where squads.id = squad_expenses.squad_id
      and (auth.uid() = squads.created_by or auth.uid() = any(squads.members))
  )
);

drop policy if exists "Members can view settlements" on public.squad_settlements;
create policy "Members can view settlements"
on public.squad_settlements
for select
using (
  exists (
    select 1 from public.squads
    where squads.id = squad_settlements.squad_id
      and (auth.uid() = squads.created_by or auth.uid() = any(squads.members))
  )
);

drop policy if exists "Members can add settlements" on public.squad_settlements;
create policy "Members can add settlements"
on public.squad_settlements
for insert
with check (
  exists (
    select 1 from public.squads
    where squads.id = squad_settlements.squad_id
      and (auth.uid() = squads.created_by or auth.uid() = any(squads.members))
  )
);
