alter table public.user_integrations
  add column if not exists next_sync_at timestamptz;

create index if not exists user_integrations_due_sync_idx
  on public.user_integrations (next_sync_at)
  where sync_frequency <> 'manual';

create or replace function public.claim_due_integrations(batch_size integer default 10)
returns setof public.user_integrations
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with due as (
    select integrations.user_id
    from public.user_integrations as integrations
    where integrations.sync_frequency <> 'manual'
      and integrations.next_sync_at <= now()
    order by integrations.next_sync_at asc
    for update skip locked
    limit greatest(1, least(batch_size, 50))
  )
  update public.user_integrations as integrations
  set last_sync_status = 'running',
      last_sync_message = 'Scheduled synchronization is running.',
      next_sync_at = now() + interval '15 minutes'
  from due
  where integrations.user_id = due.user_id
  returning integrations.*;
end;
$$;

revoke all on function public.claim_due_integrations(integer) from public, anon, authenticated;
grant execute on function public.claim_due_integrations(integer) to service_role;
