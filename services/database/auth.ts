import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { database } from "./client";
export function authReady() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
export async function authClient() {
  if (!authReady()) throw new Error("AUTH_NOT_CONFIGURED");
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
      cookies: {
        getAll() {
          return jar.getAll();
        },
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Read-only Server Component: refresh occurs in proxy. */
          }
        },
      },
    },
  );
}
export async function getAdmin() {
  if (!authReady()) return null;
  const client = await authClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data, error: membershipError } = await database()
    .from("admin_users")
    .select("id,display_name,role")
    .eq("id", user.id)
    .eq("active", true)
    .maybeSingle();
  if (membershipError) throw new Error("MEMBERSHIP_CHECK_FAILED");
  return data;
}
