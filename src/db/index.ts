import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import * as schema from "./schema";

/**
 * Retorna un cliente Drizzle atado al binding D1 `DB` de la request actual.
 * No usar un cliente global: en Workers cada request necesita su propio
 * cliente (ver https://opennext.js.org/cloudflare/howtos/db).
 *
 * El `cache()` de React reutiliza el cliente dentro de la misma request.
 */
export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  const d1 = (env as unknown as Record<string, unknown>).DB;
  if (!d1) {
    throw new Error(
      "D1 binding `DB` no encontrado. Verifica wrangler.jsonc (d1_databases) y que ejecutas con `opennextjs-cloudflare dev` o desplegado en Cloudflare."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return drizzle(d1 as any, { schema });
});

export type AppDb = ReturnType<typeof getDb>;

/**
 * Versión async para rutas estáticas (ISR/SSG) donde el contexto
 * solo está disponible de forma asíncrona.
 */
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  const d1 = (env as unknown as Record<string, unknown>).DB;
  if (!d1) {
    throw new Error("D1 binding `DB` no encontrado (contexto async).");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return drizzle(d1 as any, { schema });
});
