import "server-only";
import { createClient } from "@supabase/supabase-js";
export function databaseReady() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.AUTH_SECRET &&
    process.env.AUTH_SECRET.length >= 32
  );
}
export function database() {
  if (!databaseReady()) throw new Error("DATABASE_NOT_CONFIGURED");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
