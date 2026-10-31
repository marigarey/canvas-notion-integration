create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  email text not null,
  subject text not null,
  message text not null,
  source_fingerprint text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create index if not exists contact_messages_rate_limit_idx
  on public.contact_messages (source_fingerprint, created_at desc);
