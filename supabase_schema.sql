-- Bu SQL-i Supabase layihənin "SQL Editor" bölməsində işə sal.

create table profiles (
  id text primary key,
  name text not null,
  bio text,
  pin text not null,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  from_id text references profiles(id),
  to_id text references profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- Realtime-ı messages cədvəli üçün aktiv et
alter publication supabase_realtime add table messages;

-- Sadəlik üçün RLS-i açıq saxlayırıq (tanışlar arasında, ictimai deyil)
alter table profiles enable row level security;
alter table messages enable row level security;

create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_all" on profiles for insert with check (true);

create policy "messages_select_all" on messages for select using (true);
create policy "messages_insert_all" on messages for insert with check (true);
