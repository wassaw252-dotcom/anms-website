import { z } from "zod";
import {
  apiError,
  body,
  checkOrigin,
  HttpError,
  json,
  rateLimit,
} from "@/lib/security";
import { authClient } from "@/services/database/auth";
import { database } from "@/services/database/client";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await rateLimit(request, "login", 8, 900);
    const input = await body(
      request,
      z
        .object({
          email: z.email().max(254),
          password: z.string().min(1).max(256),
        })
        .strict(),
    );
    const auth = await authClient();
    const { data, error } = await auth.auth.signInWithPassword(input);
    if (error || !data.user)
      throw new HttpError(401, "The sign-in details could not be verified.");
    const { data: member, error: memberError } = await database()
      .from("admin_users")
      .select("id")
      .eq("id", data.user.id)
      .eq("active", true)
      .maybeSingle();
    if (memberError || !member) {
      await auth.auth.signOut();
      throw new HttpError(403, "This account does not have team access.");
    }
    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
