"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/auth";
import { createSession, timingSafeEqualStr, SESSION_TTL_MS } from "@/lib/session";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const rawFrom = String(formData.get("from") ?? "/admin");
  // Solo se aceptan destinos dentro del panel (evita open redirects).
  const from = rawFrom.startsWith("/admin") ? rawFrom : "/admin";

  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !timingSafeEqualStr(password, expected)) {
    // Freno barato a fuerza bruta: cada intento fallido cuesta ~1s.
    await new Promise((r) => setTimeout(r, 1000));
    // Preservar el destino para que el reintento correcto aterrice donde iba.
    redirect(`/login?error=1&from=${encodeURIComponent(from)}`);
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  redirect(from);
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/login");
}
