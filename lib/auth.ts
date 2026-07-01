import { cookies } from "next/headers";
import { verifySession } from "./session";

export const ADMIN_COOKIE = "qh_admin";

// Verifica la cookie de sesión firmada del admin (para server components / actions).
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return (await verifySession(token)) !== null;
}
