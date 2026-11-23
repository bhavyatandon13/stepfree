-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Stores messages from the "Write to us" form on the home page.
create table if not exists enquiries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) <= 100),
  email text not null check (char_length(email) <= 200),
  message text not null check (char_length(message) <= 2000)
);

-- Row level security on. The website uses the public (publishable) key, which may only ADD
-- messages that pass the same checks as the form. Nobody can read messages from outside;
-- read them in the Supabase dashboard (Table Editor -> enquiries).
alter table enquiries enable row level security;

grant insert on table public.enquiries to anon;
grant all on table public.enquiries to service_role;

create policy "Anyone can send a message"
  on public.enquiries
  for insert
  to anon
  with check (
    char_length(trim(name)) between 1 and 100
    and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
    and char_length(email) <= 200
    and char_length(trim(message)) between 1 and 2000
  );
