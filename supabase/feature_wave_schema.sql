create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.profiles(id) on delete cascade,
  referred_phone text,
  referral_code text not null,
  referred_user_id uuid references public.profiles(id) on delete set null,
  reward_xp integer not null default 500,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.expense_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null default 0,
  category text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists referrals_referrer_code_idx
on public.referrals(referrer_user_id, referral_code);

create index if not exists referrals_referred_user_id_idx
on public.referrals(referred_user_id);

create index if not exists expense_templates_user_created_idx
on public.expense_templates(user_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

alter table public.referrals enable row level security;
alter table public.expense_templates enable row level security;

drop policy if exists "Users can view own referrals" on public.referrals;
create policy "Users can view own referrals"
on public.referrals
for select
using (auth.uid() = referrer_user_id or auth.uid() = referred_user_id);

drop policy if exists "Users can create own referrals" on public.referrals;
create policy "Users can create own referrals"
on public.referrals
for insert
with check (auth.uid() = referrer_user_id);

drop policy if exists "Users can update own referrals" on public.referrals;
create policy "Users can update own referrals"
on public.referrals
for update
using (auth.uid() = referrer_user_id)
with check (auth.uid() = referrer_user_id);

drop policy if exists "Users can view own expense templates" on public.expense_templates;
create policy "Users can view own expense templates"
on public.expense_templates
for select
using (auth.uid() = user_id);

drop policy if exists "Users can manage own expense templates" on public.expense_templates;
create policy "Users can manage own expense templates"
on public.expense_templates
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can upload own receipts" on storage.objects;
create policy "Users can upload own receipts"
on storage.objects
for insert
with check (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can read own receipts" on storage.objects;
create policy "Users can read own receipts"
on storage.objects
for select
using (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);
