import "server-only";
import { database } from "./client";
import { discoveryOutput, type Message } from "@/lib/validation/schemas";
export async function messagesFor(id: string): Promise<Message[]> {
  const { data, error } = await database()
    .from("messages")
    .select("id,role,content,created_at,client_id")
    .eq("conversation_id", id)
    .order("sequence");
  if (error) throw new Error("MESSAGES_READ_FAILED");
  return data || [];
}
export async function publicSession(conversation: Record<string, unknown>) {
  const messages = await messagesFor(conversation.id as string);
  const parsed = discoveryOutput.safeParse(conversation.assessment);
  const { data, error } = await database()
    .from("submissions")
    .select("reference,consultation_requested")
    .eq("conversation_id", conversation.id)
    .maybeSingle();
  if (error) throw new Error("SUBMISSION_READ_FAILED");
  return {
    messages: messages.map(({ id, role, content, client_id }) => ({
      id,
      role,
      content,
      client_id,
    })),
    assessment: parsed.success
      ? {
          problem_summary: parsed.data.problem_summary,
          desired_outcome: parsed.data.desired_outcome,
          enough_information: parsed.data.enough_information,
        }
      : null,
    submitted: data
      ? {
          reference: data.reference,
          consultation_requested: data.consultation_requested,
        }
      : null,
  };
}
