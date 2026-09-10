import {
  apiError,
  checkOrigin,
  HttpError,
  json,
  rateLimit,
  session,
} from "@/lib/security";
import { database } from "@/services/database/client";
import { whatsappUrl } from "@/lib/config";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const current = await session();
    await rateLimit(request, "consultation", 10, 60);
    const { data, error } = await database()
      .from("submissions")
      .select("id,reference")
      .eq("conversation_id", current.id)
      .maybeSingle();
    if (error) throw new Error("SUBMISSION_READ_FAILED");
    if (!data) throw new HttpError(404, "Please submit your request first.");
    const url = whatsappUrl(data.reference);
    if (!url)
      throw new HttpError(
        503,
        "Direct consultation contact is not available yet.",
      );
    const { error: updateError } = await database().rpc(
      "request_consultation",
      { p_submission: data.id },
    );
    if (updateError) throw new Error("CONSULTATION_SAVE_FAILED");
    return json({ url });
  } catch (error) {
    return apiError(error);
  }
}
