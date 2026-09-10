import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/services/database/auth";
import { database } from "@/services/database/client";
import { Brand } from "@/components/brand";
import { statuses } from "@/lib/validation/schemas";
import { markRead } from "./actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Engineering pipeline",
  robots: { index: false, follow: false },
};
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; filter?: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard/login");
  const params = await searchParams;
  const db = database();
  let query = db
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (statuses.includes(params.status as (typeof statuses)[number]))
    query = query.eq("status", params.status);
  if (params.filter === "consultation")
    query = query.eq("consultation_requested", true);
  if (params.filter === "priority")
    query = query.in("priority", ["High", "Critical"]);
  const results = await Promise.all([
    query,
    db
      .from("notifications")
      .select(
        "id,kind,submission_id,submissions(reference,name,company,problem_summary)",
      )
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    db.from("submissions").select("status,priority,consultation_requested"),
  ]);
  if (results.some((x) => x.error))
    throw new Error("Dashboard data could not be loaded.");
  const rows = results[0].data || [],
    notifications = results[1].data || [],
    all = results[2].data || [];
  const stats = [
    [
      "NEW REQUESTS",
      all.filter((x) => x.status === "NEW").length,
      "status=NEW",
    ],
    [
      "HIGH PRIORITY",
      all.filter((x) => ["High", "Critical"].includes(x.priority)).length,
      "filter=priority",
    ],
    [
      "AWAITING ENGINEERING",
      all.filter((x) => x.status === "ENGINEERING REVIEW").length,
      "status=ENGINEERING%20REVIEW",
    ],
    [
      "CONSULTATION REQUESTS",
      all.filter((x) => x.consultation_requested).length,
      "filter=consultation",
    ],
    [
      "PROPOSALS",
      all.filter((x) => x.status === "PROPOSAL").length,
      "status=PROPOSAL",
    ],
    [
      "ACTIVE PROJECTS",
      all.filter((x) => x.status === "WON").length,
      "status=WON",
    ],
  ];
  return (
    <main id="main" className="dashboard">
      <div className="dashboard-header">
        <Brand />
        <div>
          <p className="eyebrow">
            PRIVATE / {admin.display_name} / {admin.role}
          </p>
          <h1>Engineering pipeline</h1>
        </div>
        <form action="/api/auth/logout" method="post">
          <button>Sign out</button>
        </form>
      </div>
      <div className="dashboard-stats">
        {stats.map(([label, n, q]) => (
          <Link href={`/dashboard?${q}`} key={label}>
            <span>{label}</span>
            <strong>{n}</strong>
          </Link>
        ))}
      </div>
      <p style={{ fontSize: 12 }}>
        Active projects shows won opportunities in V1. Internal scores are
        preliminary and require human review.
      </p>
      {notifications.length ? (
        <details className="detail-panel">
          <summary>Notifications ({notifications.length})</summary>
          {notifications.map((n) => (
            <div className="notification" key={n.id}>
              <strong>
                {n.kind === "HIGH_VALUE"
                  ? "HIGH-VALUE OPPORTUNITY"
                  : n.kind === "CONSULTATION"
                    ? "CONSULTATION REQUEST"
                    : "NEW REQUEST"}
              </strong>
              <Link href={`/dashboard/requests/${n.submission_id}`}>
                Open request and assessment ↗
              </Link>
              <form action={markRead}>
                <input type="hidden" name="id" value={n.id} />
                <button
                  className="text-link"
                  style={{ background: "none", border: 0, marginTop: 10 }}
                >
                  Mark read
                </button>
              </form>
            </div>
          ))}
        </details>
      ) : null}
      <nav className="pipeline-filter" aria-label="Pipeline status">
        <Link
          href="/dashboard"
          className={!params.status && !params.filter ? "selected" : ""}
        >
          ALL
        </Link>
        {statuses.map((s) => (
          <Link
            className={params.status === s ? "selected" : ""}
            href={`/dashboard?status=${encodeURIComponent(s)}`}
            key={s}
          >
            {s}
          </Link>
        ))}
      </nav>
      {rows.length ? (
        <div className="request-list">
          {rows.map((row) => (
            <Link
              className="request-card"
              href={`/dashboard/requests/${row.id}`}
              key={row.id}
            >
              <span className="eyebrow">
                {row.reference} / {row.status}
              </span>
              <h2>{row.company || row.name}</h2>
              {row.company ? <small>{row.name}</small> : null}
              <p>{row.problem_summary}</p>
              <small>
                {row.request_type} ·{" "}
                {new Date(row.created_at).toLocaleDateString("en-GB")}
              </small>
              <div className="tags">
                <span className="tag">PRIORITY: {row.priority}</span>
                <span className="tag">VALUE: {row.potential_value}</span>
                <span className="tag">COMPLEXITY: {row.complexity}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No requests in this view.</h2>
          <p>Completed discovery submissions will appear here for review.</p>
        </div>
      )}
      <p style={{ fontSize: 11, marginTop: 25 }}>
        Showing the latest 100 matching requests. No external notifications are
        configured.
      </p>
    </main>
  );
}
