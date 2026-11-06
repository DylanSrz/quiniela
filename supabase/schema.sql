-- Esquema de Quiniela Hunters: tablas, trigger de puntos y políticas RLS.
--
-- Reconstruido desde el código (lib/database.types.ts, lib/standings.ts,
-- app/admin/actions.ts y components/LiveRefresh.tsx) y desde el plan del proyecto.
-- No es un volcado de la base de producción: se probó en PostgreSQL, pero conviene
-- compararlo con `supabase db dump` si ese proyecto se vuelve a activar.
--
-- Uso: pegar en el SQL Editor de Supabase sobre una base vacía y luego cargar
-- scripts/seed-matches.sql y scripts/update-kickoffs.sql.

create table participants (
  id serial primary key,
  display_name text unique not null,
  avatar_emoji text not null default '⚽',
  created_at timestamptz not null default now()
);

create table matches (
  id int primary key,
  code text unique not null,
  group_letter text not null,
  jornada text not null,
  kickoff_utc timestamptz not null,
  home_team text not null,
  away_team text not null,
  home_goals int,
  away_goals int,
  finished boolean not null default false
);

create table predictions (
  participant_id int not null references participants (id) on delete cascade,
  match_id int not null references matches (id),
  pred_home int not null,
  pred_away int not null,
  points numeric(3, 1), -- null = partido sin resultado
  primary key (participant_id, match_id)
);

-- Misma lógica que scoreOf() en lib/standings.ts.
create or replace function score_of(
  pred_home int, pred_away int, home int, away int
) returns numeric language sql immutable as $$
  select case
    when pred_home = home and pred_away = away then 3
    when home = away and pred_home = pred_away then 1
    when home <> away and sign(pred_home - pred_away) = sign(home - away) then 1.5
    else 0
  end;
$$;

-- Al guardar un resultado se recalculan los puntos de todos los pronósticos del partido.
create or replace function recalc_points() returns trigger language plpgsql as $$
begin
  update predictions
  set points = case
    when new.finished then score_of(pred_home, pred_away, new.home_goals, new.away_goals)
    else null
  end
  where match_id = new.id;
  return new;
end;
$$;

create trigger trg_recalc_points
after update of home_goals, away_goals, finished on matches
for each row execute function recalc_points();

-- RLS: lectura pública. Sin políticas de escritura, solo la service role (que omite
-- RLS y se usa únicamente en las server actions del admin) puede modificar datos.
alter table participants enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;

create policy "lectura publica" on participants for select using (true);
create policy "lectura publica" on matches for select using (true);
create policy "lectura publica" on predictions for select using (true);

-- Realtime para components/LiveRefresh.tsx (la publicación solo existe en Supabase).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table matches, predictions;
  end if;
end;
$$;
