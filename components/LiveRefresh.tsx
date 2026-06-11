"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Refresca la página cuando cambian resultados o pronósticos (Supabase Realtime),
// con un polling de respaldo cada 45s por si el websocket no está disponible.
export default function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const sb = supabaseBrowser();
    const channel = sb
      .channel("quiniela-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "predictions" },
        () => router.refresh()
      )
      .subscribe();

    const poll = setInterval(() => router.refresh(), 45_000);

    return () => {
      clearInterval(poll);
      sb.removeChannel(channel);
    };
  }, [router]);

  return null;
}
