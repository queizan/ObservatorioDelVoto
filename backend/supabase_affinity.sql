-- OBSERVATORIO DEL VOTO / TEST NO OFICIAL / 2023 / v3
-- Ejecutar UNA VEZ en Supabase > SQL Editor > Run, y también es re-ejecutable.
-- No se guardan respuestas, direcciones IP, identificadores ni filas individuales.
-- Solo contadores agregados de primeras coincidencias.
-- Supabase y el servicio web podrían conservar registros técnicos ajenos a esta tabla.
-- ATENCION: votaciones repetidas permitidas por diseño. No hay garantía antibots.
begin;
create table if not exists public.affinity_totals(
  party text primary key,
  first_count bigint not null default 0 check(first_count >= 0)
);

-- El esquema anterior solo admitía PP, PSOE, VOX y SUMAR.
-- Eliminar la restricción obsoleta SIN borrar ningún contador existente.
alter table public.affinity_totals
  drop constraint if exists affinity_totals_party_check;
alter table public.affinity_totals
  add constraint affinity_totals_party_check
  check(party in ('PP','PSOE','VOX','SUMAR','ERC','JUNTS','BILDU','PNV','BNG','PACMA','CC'));

insert into public.affinity_totals(party)
values ('PP'),('PSOE'),('VOX'),('SUMAR'),('ERC'),('JUNTS'),
       ('BILDU'),('PNV'),('BNG'),('PACMA'),('CC')
on conflict (party) do nothing;

alter table public.affinity_totals enable row level security;
revoke all on public.affinity_totals from public, anon, authenticated;
grant select on public.affinity_totals to anon, authenticated;
drop policy if exists "Read aggregate affinity counts" on public.affinity_totals;
create policy "Read aggregate affinity counts" on public.affinity_totals
  for select to anon, authenticated using (true);

-- Eliminar firma antigua de dos etiquetas. Solo se publica la PRIMERA.
drop function if exists public.submit_affinity_vote(text,text);
create or replace function public.submit_affinity_vote(p_first text)
returns void language plpgsql security definer set search_path=''
as $$
begin
  if p_first is null or p_first not in
    ('PP','PSOE','VOX','SUMAR','ERC','JUNTS','BILDU','PNV','BNG','PACMA','CC')
  then
    raise exception 'Unsupported programme label';
  end if;
  update public.affinity_totals
  set first_count=first_count+1 where party=p_first;
  if not found then raise exception 'Missing aggregate row'; end if;
end;
$$;
revoke all on function public.submit_affinity_vote(text) from public;
grant execute on function public.submit_affinity_vote(text) to anon, authenticated;
commit;

-- Diagnóstico: deben aparecer once filas, sin borrar recuentos previos.
select party, first_count,
  round(first_count*100.0/nullif(sum(first_count) over(),0),2) as percentage
from public.affinity_totals order by party;
