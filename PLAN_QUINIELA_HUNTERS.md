# Plan de Desarrollo — Quiniela Hunters (Mundial 2026) · v2

> Documento de planificación para Claude Code. Actualizado el 10 de junio de 2026.
> El Mundial inicia **mañana, 11 de junio** — priorizar Fases 1–3.

## 1. Contexto y decisión de arquitectura

Quiniela privada entre **9 amigos** ("Quiniela Hunters") para la **fase de grupos** del Mundial FIFA 2026 (72 partidos, 12 grupos A–L, 3 jornadas). Todos ya entregaron sus pronósticos en Excel **con el mismo formato**.

**Decisión clave (v2):** modelo **admin-céntrico**. No hay registro ni login de participantes. Dylan, como único administrador:

1. Crea los 9 perfiles (solo nombre + avatar opcional).
2. Carga los pronósticos de cada uno **subiendo su Excel** al panel admin (parser automático).
3. Ingresa los resultados de los partidos manualmente a medida que se juegan.

El resto de la web es **pública y de solo lectura**: tabla de posiciones, resultados de partidos y comparativa de pronósticos, todo recalculado automáticamente al guardar cada resultado.

Esto elimina: API externa de resultados, cron jobs/GitHub Actions, Supabase Auth multi-usuario, RLS por usuario, y lógica de bloqueo de pronósticos.

## 2. Reglas de negocio

**Sistema de puntos (por partido):**

| Acierto | Puntos |
|---|---|
| Marcador exacto | **3** |
| Solo resultado (G-E-P) | **1** |
| Nada | **0** |

- Solo fase de grupos. Sin eliminatorias ni bonus.
- Ganador: mayor puntaje total. Desempates informativos: # de exactos, luego # de resultados acertados.

## 3. Stack

- **Next.js 14+ (App Router) + TypeScript + Tailwind CSS**
- **Supabase** (solo Postgres; auth únicamente para el admin — un solo usuario, o alternativamente middleware con contraseña en variable de entorno)
- **Vercel** (Hobby sobra: sin crons, sin APIs externas)
- **SheetJS (`xlsx`)** en el panel admin para parsear los Excel de los participantes

## 4. Modelo de datos (Supabase)

```sql
create table participants (
  id serial primary key,
  display_name text unique not null,
  avatar_emoji text default '⚽',
  created_at timestamptz default now()
);

-- Seed: partidos_fase_grupos.json (72 filas)
create table matches (
  id int primary key,
  code text unique not null,          -- ej: 'A-J1-MÉX-SUD'
  group_letter text not null,         -- 'A'..'L'
  jornada text not null,              -- 'J1','J2','J3'
  kickoff_utc timestamptz not null,
  home_team text not null,
  away_team text not null,
  home_goals int,                     -- null = sin jugar
  away_goals int,
  finished boolean default false
);

create table predictions (
  participant_id int references participants(id) on delete cascade,
  match_id int references matches(id),
  pred_home int not null,
  pred_away int not null,
  points int,                         -- se calcula al guardar resultado
  primary key (participant_id, match_id)
);
```

**Cálculo de puntos** — trigger en Postgres al actualizar `matches` (o server action tras guardar):

```sql
create or replace function recalc_points() returns trigger as $$
begin
  if new.finished then
    update predictions set points =
      case
        when pred_home = new.home_goals and pred_away = new.away_goals then 3
        when sign(pred_home - pred_away) = sign(new.home_goals - new.away_goals) then 1
        else 0
      end
    where match_id = new.id;
  else
    update predictions set points = null where match_id = new.id;
  end if;
  return new;
end; $$ language plpgsql;

create trigger trg_recalc after update of home_goals, away_goals, finished
on matches for each row execute function recalc_points();
```

Con el trigger, la app solo escribe el resultado y la tabla de posiciones queda consistente sin lógica adicional.

**Acceso a datos:** páginas públicas leen con la anon key (RLS: `select` público en las 3 tablas; `insert/update/delete` solo con service role desde server actions del admin).

## 5. Parser de Excel (panel admin)

Formato común de los 9 archivos (hoja `Hoja1`, layout `A1:R42`):

- 6 bloques verticales de 7 filas (1 header + 6 partidos), en dos columnas de grupos:
  - Bloque izquierdo: grupo en col `A`, datos en `B:H` (Fecha, Hora, Jor., Casa, Gol, Gol, Fuera)
  - Bloque derecho: grupo en col `K`, datos en `L:R`
- Filas de inicio de bloque: 2, 9, 16, 23, 30, 37 → grupos (A,G), (B,H), (C,I), (D,J), (E,K), (F,L)
- Goles del pronóstico en cols `F/G` (izq) y `P/Q` (der)

Flujo en admin: seleccionar participante → subir `.xlsx` → parsear con SheetJS → **emparejar cada fila con `matches` por (grupo, jornada, equipo casa, equipo fuera)** → vista previa de los 72 pronósticos con validación (faltantes, equipos que no emparejan, valores no numéricos) → confirmar → upsert en `predictions`.

Importante: emparejar por nombres de equipo normalizados (trim, lowercase, sin tildes) por si algún amigo editó algo. Reportar cualquier fila que no empareje en vez de fallar silenciosamente.

## 6. Páginas

**Públicas (sin login):**

1. **/** Tabla de posiciones — ranking de los 9: puntos, # exactos, # resultados, partidos jugados. Resaltar líder. Revalidación corta (`revalidate = 60`) o Supabase Realtime.
2. **/partidos** — los 72 partidos por grupo/jornada con marcador real; los jugados muestran grilla comparativa de los 9 pronósticos con puntos obtenidos (3 verde / 1 amarillo / 0 gris).
3. **/participante/[id]** — los 72 pronósticos de un participante con sus puntos por partido y total acumulado por jornada.

**Admin (`/admin`, protegido):**

4. Gestión de participantes (crear/editar los 9 perfiles).
5. Carga de pronósticos vía Excel (sección 5) con vista previa antes de confirmar.
6. **Ingreso de resultados**: lista de partidos del día / pendientes, inputs de goles, marcar como finalizado → el trigger recalcula todo. Permitir editar un resultado ya guardado (corrección de errores).

**UI:** mobile-first (lo verán desde el celular), dark mode, horas en **America/Bogota**, banderas emoji por equipo.

## 7. Datos seed incluidos

- `partidos_fase_grupos.json` — 72 partidos (id, código, grupo, jornada, fecha, hora local Bogotá, equipos). Convertir hora Bogotá → UTC (+5h) al sembrar `kickoff_utc`.
- `pronosticos_dylan.json` — los 72 pronósticos de Dylan: usarlos como primer participante y para probar el parser/cálculo end-to-end.

## 8. Fases de desarrollo

- **Fase 1 — Base (hoy):** proyecto, schema + trigger, seed de partidos, protección de /admin.
- **Fase 2 — Carga (hoy):** CRUD de participantes, parser de Excel con vista previa, cargar los 9 archivos.
- **Fase 3 — Resultados y posiciones (hoy/mañana):** ingreso de resultados en admin, tabla de posiciones pública. *App operativa para el partido inaugural.*
- **Fase 4 — Comparativas:** vista de partidos con grilla de pronósticos, página por participante.
- **Fase 5 — Pulido:** realtime, gráfica de evolución por jornada, compartir link del ranking al grupo de WhatsApp.

## 9. Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=             # si se opta por middleware simple en vez de Supabase Auth
```
