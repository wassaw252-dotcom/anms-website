import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getAdmin } from "@/services/database/auth";
import { database } from "@/services/database/client";
import { messagesFor } from "@/services/database/conversations";
import { statuses } from "@/lib/validation/schemas";
import { addNote, updateRequest } from "../../actions";
import { SaveButton } from "@/components/dashboard/save-button";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Engineering request",
  robots: { index: false, follow: false },
};
function Report({ data }: { data: Record<string, unknown> }) {
  return (
    <dl>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <dt>{key.replaceAll("_", " ")}</dt>
          <dd>
            {value === null
              ? "NEEDS ENGINEERING ASSESSMENT"
              : Array.isArray(value)
                ? value.length
                  ? value.join("\n")
                  : "NEEDS ENGINEERING ASSESSMENT"
                : String(value || "NEEDS ENGINEERING ASSESSMENT")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard/login");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const db = database();
  const { data: request, error } = await db
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Request unavailable.");
  if (!request) notFound();
  const results = await Promise.all([
    db
      .from("opportunity_reports")
      .select("data")
      .eq("submission_id", id)
      .single(),
    db
      .from("engineering_briefs")
      .select("data")
      .eq("submission_id", id)
      .single(),
    db
      .from("internal_notes")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: false }),
    db.from("admin_users").select("id,display_name").eq("active", true),
    db
      .from("status_history")
      .select("*")
      .eq("submission_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (results.some((r) => r.error))
    throw new Error("Request details could not be loaded.");
  const [opportunity, brief, notes, members, history] = results;
  const messages = await messagesFor(request.conversation_id);
  const report = opportunity.data!.data;
  return (
    <main id="main" className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link href="/dashboard" className="text-link">
            ← Pipeline
          </Link>
          <p className="eyebrow" style={{ marginTop: 20 }}>
            {request.reference} / {request.status}
          </p>
          <h1>{request.company || request.name}</h1>
        </div>
        <p>PRIVATE / ENGINEERING REVIEW</p>
      </div>
      {request.potential_value === "High" &&
      ["High", "Critical"].includes(request.priority) ? (
        <div className="notification">
          <strong>HIGH-VALUE OPPORTUNITY / PRELIMINARY</strong>
          <p>{request.problem_summary}</p>
          <p>Why it matters: {report.priority_reason}</p>
          <p>Business impact: {report.business_impact}</p>
          <p>
            Potential opportunity: {report.potential_opportunities?.join("; ")}
          </p>
          <p>Complexity: {report.implementation_complexity}</p>
          <p>Missing information: {report.missing_information?.join("; ")}</p>
          <p>Next action: {report.recommended_next_step}</p>
        </div>
      ) : null}
      <div className="detail-grid">
        <div>
          <section className="detail-panel">
            <h2>The request</h2>
            <h3>Problem / idea</h3>
            <p>{request.problem_summary}</p>
            <h3>Desired outcome</h3>
            <p>{request.desired_outcome}</p>
            <details>
              <summary>View discovery</summary>
              {messages.map((m) => (
                <div key={m.id}>
                  <h3>{m.role === "user" ? "Customer" : "ANM’s discovery"}</h3>
                  <p>{m.content}</p>
                </div>
              ))}
            </details>
            <details>
              <summary>View opportunity report</summary>
              <p style={{ marginTop: 20 }}>
                Automated preliminary assessment. Human review required.
              </p>
              <Report
                data={{
                  name: request.name,
                  company: request.company,
                  ...report,
                }}
              />
            </details>
            <details>
              <summary>View engineering brief</summary>
              <Report data={brief.data!.data} />
            </details>
          </section>
          <section className="detail-panel">
            <h2>Internal notes</h2>
            <form action={addNote}>
              <input type="hidden" name="id" value={id} />
              <label className="field">
                Add a note
                <textarea name="note" rows={4} maxLength={8000} required />
              </label>
              <SaveButton label="Add note" />
            </form>
            {notes.data?.map((note) => (
              <div key={note.id}>
                <h3>
                  {members.data?.find((m) => m.id === note.author_id)
                    ?.display_name || "Team member"}{" "}
                  · {new Date(note.created_at).toLocaleString("en-GB")}
                </h3>
                <p>{note.content}</p>
              </div>
            ))}
          </section>
        </div>
        <aside>
          <section className="detail-panel">
            <h2>Review & assignment</h2>
            <form action={updateRequest}>
              <input type="hidden" name="id" value={id} />
              <label className="field">
                Pipeline status
                <select name="status" defaultValue={request.status}>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Assign to
                <select
                  name="assignee"
                  defaultValue={request.assigned_to || ""}
                >
                  <option value="">Unassigned</option>
                  {members.data?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name}
                    </option>
                  ))}
                </select>
              </label>
              <SaveButton />
            </form>
          </section>
          <section className="detail-panel">
            <h2>Contact customer</h2>
            <p>
              {request.name}
              <br />
              {request.company}
            </p>
            <p>
              <a href={`mailto:${request.email}`}>{request.email}</a>
              <br />
              <a href={`tel:${request.phone.replace(/[^+0-9]/g, "")}`}>
                {request.phone}
              </a>
            </p>
            <a
              className="button small"
              href={`https://wa.me/${request.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${request.name}, this is ANM’s regarding request ${request.reference}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open WhatsApp ↗
            </a>
            <h3>Consultation</h3>
            <p>
              {request.consultation_requested
                ? "Requested via WhatsApp. Confirm fee, payment and scheduling manually."
                : "Not requested."}
            </p>
            <h3>Submission consent</h3>
            <p>
              {request.consent_version}
              <br />
              {new Date(request.consent_at).toLocaleString("en-GB")}
            </p>
          </section>
          <section className="detail-panel">
            <h2>Status history</h2>
            {history.data?.map((h) => (
              <div key={h.id}>
                <h3>
                  {h.old_status ? `${h.old_status} → ` : ""}
                  {h.new_status}
                </h3>
                <p>{new Date(h.created_at).toLocaleString("en-GB")}</p>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </main>
  );
}
