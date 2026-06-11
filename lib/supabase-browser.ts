"use client";

import { createClient } from "@supabase/supabase-js";

// Cliente para el navegador (solo lectura vía anon key) — usado por realtime.
export function supabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
