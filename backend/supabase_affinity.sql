-- Observatorio del Voto: counts only, no per-visitor table or answer storage.
-- Run using Supabase SQL Editor. This is a prototype; add server-side
-- anti-abuse before enabling public submissions on a high-traffic site.
begin;
create table if not exists public.affinity_totals (
  party text primary key check (party in ('PP','PSOE','VOX','SUMAR')),
  first_count bigint not null default 0 check (first_count >= 0),
  second_count bigint not null default 0 check (second_count >= 0)
);
insert into public.affinity_totals (party)
values ('PP'), ('PSOE'), ('VOX'), ('SUMAR')
on conflict (party) do nothing;
alter table public.affinity_totals enable row level security;
revoke all on public.affinity_totals from public, anon, authenticated;
grant select on public.affinity_totals to anon, authenticated;
drop policy if exists "Read aggregate affinity counts" on public.affinity_totals;
create policy "Read aggregate affinity counts" on public.affinity_totals
  for select to anon, authenticated using (true);

create or replace function public.submit_affinity_vote(p_first text, p_second text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_first is null or p_second is null or p_first = p_second
     or p_first not in ('PP','PSOE','VOX','SUMAR')
     or p_second not in ('PP','PSOE','VOX','SUMAR') then
    raise exception 'Invalid aggregate affinity selection';
  end if;
  update public.affinity_totals
  set first_count = first_count + 1 where party = p_first;
  update public.affinity_totals
  set second_count = second_count + 1 where party = p_second;
end;
$$;
revoke all on function public.submit_affinity_vote(text,text) from public;
grant execute on function public.submit_affinity_vote(text,text) to anon, authenticated;
commit;
