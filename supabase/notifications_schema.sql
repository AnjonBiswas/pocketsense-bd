create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (
    type in (
      'daily_budget',
      'overspending',
      'bill_due',
      'tuition',
      'friend_owed',
      'challenge_completion',
      'streak_milestone',
      'month_end_summary',
      'sos',
      'info'
    )
  ),
  title text not null,
  message text not null,
  read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  daily_budget boolean not null default true,
  overspending boolean not null default true,
  bill_due boolean not null default true,
  tuition boolean not null default true,
  friend_owed boolean not null default true,
  challenge_completion boolean not null default true,
  streak_milestone boolean not null default true,
  month_end_summary boolean not null default true,
  push_enabled boolean not null default false,
  email_enabled boolean not null default false,
  sms_enabled boolean not null default false,
  frequency text not null default 'immediate' check (frequency in ('immediate', 'daily', 'weekly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on public.notifications;
create policy "Users can insert own notifications"
on public.notifications
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
on public.notifications
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own notification preferences" on public.notification_preferences;
create policy "Users can view own notification preferences"
on public.notification_preferences
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own notification preferences" on public.notification_preferences;
create policy "Users can insert own notification preferences"
on public.notification_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own notification preferences" on public.notification_preferences;
create policy "Users can update own notification preferences"
on public.notification_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists notifications_user_id_created_at_idx
on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_id_read_idx
on public.notifications(user_id, read);

create index if not exists notification_preferences_user_id_idx
on public.notification_preferences(user_id);

create or replace function public.update_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;

create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row
execute function public.update_notification_preferences_updated_at();
