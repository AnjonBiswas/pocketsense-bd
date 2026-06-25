create table if not exists public.sos_modes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  is_active boolean not null default false,
  severity text not null default 'warning' check (severity in ('warning', 'critical')),
  remaining_budget numeric(12,2) not null default 0,
  days_remaining integer not null default 1,
  activated_tips text[] not null default '{}',
  locked_amount numeric(12,2) not null default 0,
  lock_pin_hash text,
  compliance_score integer not null default 0,
  activated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deactivated_at timestamptz
);

alter table public.sos_modes enable row level security;

create policy if not exists "Users can view own sos mode"
on public.sos_modes
for select
using (auth.uid() = user_id);

create policy if not exists "Users can insert own sos mode"
on public.sos_modes
for insert
with check (auth.uid() = user_id);

create policy if not exists "Users can update own sos mode"
on public.sos_modes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists sos_modes_user_id_idx on public.sos_modes(user_id);

create or replace function public.update_sos_modes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sos_modes_updated_at on public.sos_modes;

create trigger trg_sos_modes_updated_at
before update on public.sos_modes
for each row
execute function public.update_sos_modes_updated_at();
