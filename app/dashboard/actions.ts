"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/services/database/auth";
import { database } from "@/services/database/client";
import { statusSchema } from "@/lib/validation/schemas";
export async function updateRequest(form: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard/login");
  const id = z.uuid().parse(form.get("id"));
  const status = statusSchema.parse(form.get("status"));
  const assignee = z
    .uuid()
    .nullable()
    .parse(form.get("assignee") || null);
  const { error } = await database().rpc("update_request_status", {
    p_submission: id,
    p_actor: admin.id,
    p_status: status,
    p_assignee: assignee,
  });
  if (error)
    throw new Error("The update could not be saved. Please try again.");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/requests/${id}`);
}
export async function addNote(form: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard/login");
  const id = z.uuid().parse(form.get("id")),
    content = z.string().trim().min(1).max(8000).parse(form.get("note"));
  const { error } = await database()
    .from("internal_notes")
    .insert({ submission_id: id, author_id: admin.id, content });
  if (error) throw new Error("The note could not be saved. Please try again.");
  revalidatePath(`/dashboard/requests/${id}`);
}
export async function markRead(form: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard/login");
  const id = z.uuid().parse(form.get("id"));
  const { error } = await database()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error("The notification could not be updated.");
  revalidatePath("/dashboard");
}
