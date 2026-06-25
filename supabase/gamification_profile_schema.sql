alter table public.profiles
add column if not exists xp integer not null default 0,
add column if not exists level integer not null default 0,
add column if not exists current_streak integer not null default 0,
add column if not exists longest_streak integer not null default 0,
add column if not exists badges text[] not null default '{}';
