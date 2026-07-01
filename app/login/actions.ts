"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/auth";
import { createSession, timingSafeEqualStr, SESSION_TTL_MS } from "@/lib/session";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !timingSafeEqualStr(password, expected)) {
    redirect("/login?error=1");
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/login");
}
