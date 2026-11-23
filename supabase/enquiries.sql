-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Stores messages from the "Write to us" form on the home page.
create table if not exists enquiries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) <= 100),
  email text not null check (char_length(email) <= 200),
  message text not null check (char_length(message) <= 2000)
);

-- Row level security on, with no rules: nobody can read or write this table from a browser.
-- Only the StepFree server (using the service_role key) can add messages.
alter table enquiries enable row level security;
