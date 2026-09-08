import { randomUUID } from "node:crypto";
import {
  apiError,
  body,
  checkOrigin,
  HttpError,
  json,
  rateLimit,
  session,
} from "@/lib/security";
import { turnSchema } from "@/lib/validation/schemas";
import { database } from "@/services/database/client";
import { messagesFor, publicSession } from "@/services/database/conversations";
import { discover } from "@/services/ai/discovery";
export const maxDuration = 60;
export async function POST(request: Request) {
  let saved = false;
  let conversationId: string | undefined;
  let lease: string | undefined;
  try {
    checkOrigin(request);
    const input = await body(request, turnSchema);
    const current = await session();
    conversationId = current.id;
    await rateLimit(request, "discovery", 20, 60);
    lease = randomUUID();
    const { data: result, error } = await database().rpc("begin_turn", {
      p_id: current.id,
      p_client: input.id,
      p_content: input.message,
      p_lease: lease,
    });
    if (error) throw new Error("TURN_START_FAILED");
    if (result === "busy")
      throw new HttpError(
        409,
        "A response is still being prepared. Please try again shortly.",
      );
    if (result === "limit")
      throw new HttpError(
        429,
        "This discovery has reached its message limit. Please contact ANM’s to continue.",
      );
    if (result === "submitted")
      throw new HttpError(409, "This request has already been submitted.");
    if (result === "conflict")
      throw new HttpError(
        409,
        "Please retry your previous message before sending another.",
      );
    if (result === "done") return json(await publicSession(current));
    saved = true;
    const history = await messagesFor(current.id);
    const output = await discover(
      history.map(({ role, content }) => ({ role, content })),
    );
    const { error: saveError } = await database().rpc("finish_turn", {
      p_id: current.id,
      p_client: input.id,
      p_lease: lease,
      p_content: output.reply,
      p_assessment: output,
    });
    if (saveError) throw new Error("TURN_SAVE_FAILED");
    return json({
      ...(await publicSession({ ...current, assessment: output })),
      saved: true,
    });
  } catch (error) {
    if (conversationId && lease) {
      await Promise.resolve(
        database().rpc("release_conversation", {
          p_id: conversationId,
          p_lease: lease,
        }),
      ).catch(() => {});
    }
    if (saved)
      return json(
        {
          error:
            "We’re having trouble processing your request right now. Your progress has been saved. Please try again shortly.",
          saved: true,
        },
        503,
      );
    return apiError(error);
  }
}
