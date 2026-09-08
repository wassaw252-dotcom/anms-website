import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { database } from "@/services/database/client";
import { z } from "zod";
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-anm-discovery"
    : "anm-discovery";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function digest(value: string) {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)
    throw new Error("AUTH_SECRET_REQUIRED");
  return createHmac("sha256", process.env.AUTH_SECRET)
    .update(value)
    .digest("hex");
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : process.env.NODE_ENV === "production"
      ? null
      : new URL(request.url).origin;
  if (!expected || origin !== expected)
    throw new HttpError(
      403,
      "This request could not be verified. Please reload and try again.",
    );
}
export async function body<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  if (!req.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Please send a valid request.");
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "Missing request.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16000) {
      await reader.cancel();
      throw new HttpError(413, "Your message is too long.");
    }
    chunks.push(value);
  }
  try {
    return schema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch {
    throw new HttpError(400, "Please check the details and try again.");
  }
}
export async function session() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    throw new HttpError(401, "Please start a discovery session.");
  const { data, error } = await database()
    .from("conversations")
    .select("*")
    .eq("token_hash", digest(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error("SESSION_READ_FAILED");
  if (!data)
    throw new HttpError(
      401,
      "This session has expired. Please start a new request.",
    );
  return data;
}
export async function newSession() {
  const token = randomBytes(32).toString("hex");
  const { data, error } = await database()
    .from("conversations")
    .insert({ token_hash: digest(token) })
    .select("id")
    .single();
  if (error) throw new Error("SESSION_CREATE_FAILED");
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return data.id;
}
export async function rateLimit(
  request: Request,
  bucket: string,
  limit = 25,
  window = 60,
) {
  const address =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";
  const key = digest(`${bucket}:${address}`);
  const { data, error } = await database().rpc("take_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window: window,
  });
  if (error) throw new Error("RATE_LIMIT_UNAVAILABLE");
  if (!data)
    throw new HttpError(429, "Please wait a moment before trying again.");
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status);
  return json(
    {
      error:
        "We’re having trouble processing your request right now. Please try again shortly.",
    },
    503,
  );
}
