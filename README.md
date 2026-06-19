# Quiniela Hunters · Mundial 2026

Quiniela privada de la fase de grupos del Mundial FIFA 2026 (72 partidos) entre 9 amigos.
Modelo **admin-céntrico**: Dylan administra perfiles, carga pronósticos desde Excel e
ingresa resultados. El resto de la web es pública y de solo lectura.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + RLS) — proyecto `quiniela-hunters`
- Motion (Framer Motion) para las animaciones de la UI
- `read-excel-file` para parsear los Excel de los participantes
- Vitest para los tests de las funciones puras

## Puesta en marcha

1. Variables de entorno en `.env.local` (copiar de `.env.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # secreto, Project Settings > API
   ADMIN_PASSWORD=...              # contraseña del panel /admin
   ADMIN_SESSION_TOKEN=...         # secreto para firmar la sesión (HMAC)
   NEXT_PUBLIC_SITE_URL=...        # opcional, para Open Graph/metadata
   ```

   La sesión del admin es una cookie firmada con HMAC-SHA256 y expiración (30 días),
   así que `ADMIN_SESSION_TOKEN` debe ser un valor aleatorio y secreto.

2. Instalar y correr:

   ```bash
   npm install
   npm run dev        # http://localhost:3000
   npm test           # tests (Vitest)
   npm run typecheck  # tsc --noEmit
   npm run lint       # eslint
   ```

## Reglas de puntuación

| Acierto | Puntos |
|---|---|
| Marcador exacto (victoria o empate) | 3 |
| Ganador acertado (sin marcador exacto) | 1.5 |
| Empate acertado (sin marcador exacto) | 1 |
| Nada | 0 |

El cálculo lo hace un trigger en Postgres al guardar cada resultado; la tabla de
posiciones se recalcula sola. Desempate: más exactos, luego más resultados.

## Estructura

- `app/` — páginas públicas (`/`, `/partidos`, `/participante/[id]`) y panel `/admin/*`.
- `app/login/` — acceso al admin (protegido por `proxy.ts`).
- `lib/` — clientes Supabase, banderas/normalización, cálculo de posiciones, formato.
- `components/` — vista de partidos, uploader de Excel, realtime, compartir.
- `scripts/` — generadores de los seeds SQL (partidos y pronósticos de Dylan).

## Flujo del admin

1. **Participantes**: crear los 9 perfiles (nombre + emoji).
2. **Cargar pronósticos**: elegir participante → subir su `.xlsx` → revisar la vista
   previa (empareja por grupo/jornada/equipos) → confirmar.
3. **Resultados**: ingresar marcadores a medida que se juegan; el trigger recalcula todo.

## Despliegue (Vercel)

Importar el repo, configurar las 5 variables de entorno y desplegar. Plan Hobby alcanza
(sin crons ni APIs externas).
