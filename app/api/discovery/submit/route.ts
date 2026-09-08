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
import { contactSchema, discoveryOutput } from "@/lib/validation/schemas";
import { database } from "@/services/database/client";
import { messagesFor } from "@/services/database/conversations";
import { generateReports } from "@/services/ai/reports";
export const maxDuration = 60;
export async function POST(request: Request) {
  let id: string | undefined, lease: string | undefined;
  try {
    checkOrigin(request);
    const contact = await body(request, contactSchema);
    const current = await session();
    id = current.id;
    await rateLimit(request, "submit", 5, 3600);
    const { data: existing, error: readError } = await database()
      .from("submissions")
      .select("reference")
      .eq("conversation_id", id)
      .maybeSingle();
    if (readError) throw new Error("SUBMISSION_READ_FAILED");
    if (existing) return json({ reference: existing.reference });
    const assessment = discoveryOutput.safeParse(current.assessment);
    if (!assessment.success || !assessment.data.enough_information)
      throw new HttpError(
        400,
        "Please complete discovery before submitting your request.",
      );
    lease = randomUUID();
    const { data: locked, error: lockError } = await database().rpc(
      "lock_submission",
      { p_id: id, p_lease: lease },
    );
    if (lockError) throw new Error("SUBMISSION_LOCK_FAILED");
    if (!locked)
      throw new HttpError(
        409,
        "Your request is still being prepared. Please try again shortly.",
      );
    const history = await messagesFor(id!);
    const reports = await generateReports(
      history.map(({ role, content }) => ({ role, content })),
    );
    const { data: reference, error } = await database().rpc("submit_request", {
      p_conversation: id,
      p_lease: lease,
      p_contact: contact,
      p_assessment: assessment.data,
      p_opportunity: reports.opportunity,
      p_brief: reports.brief,
    });
    if (error || typeof reference !== "string")
      throw new Error("SUBMISSION_SAVE_FAILED");
    return json({ reference }, 201);
  } catch (error) {
    if (id && lease)
      await Promise.resolve(
        database().rpc("release_conversation", { p_id: id, p_lease: lease }),
      ).catch(() => {});
    return apiError(error);
  }
}
