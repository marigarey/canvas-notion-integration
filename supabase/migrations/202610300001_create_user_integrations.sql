create table if not exists public.user_integrations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  canvas_base_url text,
  canvas_token_ciphertext text,
  notion_access_token_ciphertext text,
  notion_page_id text,
  notion_database_id text,
  notion_data_source_id text,
  selected_course_ids text[] not null default '{}',
  sync_frequency text not null default 'manual'
    check (sync_frequency in ('manual', 'daily', 'weekly', 'monthly')),
  last_synced_at timestamptz,
  last_sync_status text
    check (last_sync_status is null or last_sync_status in ('running', 'succeeded', 'failed')),
  last_sync_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_integrations enable row level security;

create policy "Users can read their own integration"
  on public.user_integrations for select
  using (auth.uid() = user_id);

create policy "Users can create their own integration"
  on public.user_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own integration"
  on public.user_integrations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own integration"
  on public.user_integrations for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_integrations_updated_at on public.user_integrations;
create trigger set_user_integrations_updated_at
before update on public.user_integrations
for each row execute function public.set_updated_at();
