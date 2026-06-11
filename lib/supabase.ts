import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente de solo lectura (anon key + RLS) para páginas públicas y server components.
export function supabasePublic() {
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

// Cliente con service role (bypassa RLS) — SOLO usar en server actions del admin.
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
