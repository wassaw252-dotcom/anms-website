import {
  apiError,
  checkOrigin,
  HttpError,
  json,
  newSession,
  rateLimit,
  session,
} from "@/lib/security";
import { databaseReady } from "@/services/database/client";
import { modelReady } from "@/services/ai/provider";
import { publicSession } from "@/services/database/conversations";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    if (!databaseReady())
      return json({
        available: false,
        messages: [],
        assessment: null,
        submitted: null,
      });
    try {
      return json({
        available: modelReady(),
        ...(await publicSession(await session())),
      });
    } catch (e) {
      if (e instanceof HttpError && e.status === 401)
        return json({
          available: modelReady(),
          messages: [],
          assessment: null,
          submitted: null,
        });
      throw e;
    }
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    if (!databaseReady() || !modelReady())
      throw new HttpError(
        503,
        "Discovery is not available yet. Please use direct contact when available.",
      );
    try {
      const existing = await session();
      return json({ available: true, ...(await publicSession(existing)) });
    } catch (e) {
      if (!(e instanceof HttpError && e.status === 401)) throw e;
    }
    await rateLimit(request, "sessions", 6, 3600);
    await newSession();
    return json({
      available: true,
      messages: [],
      assessment: null,
      submitted: null,
    });
  } catch (e) {
    return apiError(e);
  }
}
