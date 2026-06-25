alter table public.profiles
add column if not exists currency text not null default 'BDT',
add column if not exists theme text not null default 'system',
add column if not exists first_day_of_month integer not null default 1,
add column if not exists is_deleted boolean not null default false,
add column if not exists deleted_at timestamptz;

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  language text not null default 'bn' check (language in ('bn', 'en')),
  currency text not null default 'BDT',
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  first_day_of_month integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budget_fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null default 0,
  due_day integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;
alter table public.budget_fixed_expenses enable row level security;

drop policy if exists "Users can view own preferences" on public.user_preferences;
create policy "Users can view own preferences"
on public.user_preferences
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences"
on public.user_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences"
on public.user_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own fixed expenses" on public.budget_fixed_expenses;
create policy "Users can view own fixed expenses"
on public.budget_fixed_expenses
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own fixed expenses" on public.budget_fixed_expenses;
create policy "Users can insert own fixed expenses"
on public.budget_fixed_expenses
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own fixed expenses" on public.budget_fixed_expenses;
create policy "Users can update own fixed expenses"
on public.budget_fixed_expenses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own fixed expenses" on public.budget_fixed_expenses;
create policy "Users can delete own fixed expenses"
on public.budget_fixed_expenses
for delete
using (auth.uid() = user_id);

create index if not exists budget_fixed_expenses_user_id_idx
on public.budget_fixed_expenses(user_id);

create or replace function public.update_user_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.update_user_preferences_updated_at();

create or replace function public.update_budget_fixed_expenses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_budget_fixed_expenses_updated_at on public.budget_fixed_expenses;
create trigger trg_budget_fixed_expenses_updated_at
before update on public.budget_fixed_expenses
for each row
execute function public.update_budget_fixed_expenses_updated_at();

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are public" on storage.objects;
create policy "Avatar images are public"
on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
