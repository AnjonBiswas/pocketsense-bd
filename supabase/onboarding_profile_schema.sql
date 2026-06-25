alter table public.profiles
add column if not exists academic_year text,
add column if not exists semester text,
add column if not exists onboarding_completed boolean not null default false,
add column if not exists onboarding_step integer not null default 1;
