create extension if not exists "pgcrypto";

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('bill', 'tuition', 'budget_reset', 'custom')),
  title text not null,
  note text,
  due_date date not null,
  amount numeric(12,2),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  direction text not null check (direction in ('owed_to_me', 'i_owe')),
  due_date date,
  note text,
  status text not null default 'pending' check (status in ('pending', 'settled')),
  created_at timestamptz not null default now()
);

create index if not exists reminders_user_due_idx on public.reminders(user_id, due_date);
create index if not exists reminders_status_idx on public.reminders(status);
create index if not exists debts_user_due_idx on public.debts(user_id, due_date);
create index if not exists debts_status_idx on public.debts(status);

alter table public.reminders enable row level security;
alter table public.debts enable row level security;

drop policy if exists "Users can view their reminders" on public.reminders;
create policy "Users can view their reminders"
on public.reminders
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their reminders" on public.reminders;
create policy "Users can insert their reminders"
on public.reminders
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their reminders" on public.reminders;
create policy "Users can update their reminders"
on public.reminders
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their reminders" on public.reminders;
create policy "Users can delete their reminders"
on public.reminders
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their debts" on public.debts;
create policy "Users can view their debts"
on public.debts
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their debts" on public.debts;
create policy "Users can insert their debts"
on public.debts
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their debts" on public.debts;
create policy "Users can update their debts"
on public.debts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their debts" on public.debts;
create policy "Users can delete their debts"
on public.debts
for delete
using (auth.uid() = user_id);

