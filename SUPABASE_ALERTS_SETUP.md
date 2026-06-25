# Supabase Alerts Setup

Run [supabase/alerts_debts_schema.sql](/d:/pocketsense-bd/supabase/alerts_debts_schema.sql:1) in the Supabase SQL Editor.

This adds:

1. `reminders`
2. `debts`

What they do:

1. `reminders`
Stores real bill reminders, tuition reminders, budget reset reminders, and custom reminders.

2. `debts`
Stores money a friend owes you, or money you owe someone else.

After running the SQL, the dashboard alert engine will automatically start using these tables.

Recommended first test rows:

```sql
insert into public.reminders (user_id, kind, title, note, due_date, amount)
values
  ('YOUR_PROFILE_UUID', 'bill', 'Internet bill', 'Dorm wifi payment', current_date + 2, 500),
  ('YOUR_PROFILE_UUID', 'tuition', 'Tuition from Rafi', 'Collect monthly tuition fee', current_date + 1, 3500),
  ('YOUR_PROFILE_UUID', 'budget_reset', 'New month reset', 'Review budget and update savings target', date_trunc('month', current_date)::date);

insert into public.debts (user_id, friend_name, amount, direction, due_date, note)
values
  ('YOUR_PROFILE_UUID', 'Siam', 120, 'owed_to_me', current_date + 3, 'Tea and snacks split'),
  ('YOUR_PROFILE_UUID', 'Afiya', 300, 'i_owe', current_date + 5, 'Ride sharing');
```

How to find `YOUR_PROFILE_UUID`:

```sql
select id, phone, name from public.profiles;
```
