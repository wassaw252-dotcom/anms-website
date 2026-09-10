import { NextResponse } from "next/server";
import { apiError, checkOrigin } from "@/lib/security";
import { authClient } from "@/services/database/auth";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { error } = await (await authClient()).auth.signOut();
    if (error) throw new Error("SIGNOUT_FAILED");
    return NextResponse.redirect(new URL("/dashboard/login", request.url), 303);
  } catch (e) {
    return apiError(e);
  }
}
