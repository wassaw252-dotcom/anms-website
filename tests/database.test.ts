import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
test("transactional discovery, isolation, retries and internal handoff", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);`,
    );
    await db.exec(
      readFileSync(
        new URL(
          "../supabase/migrations/20260908151759_anms_platform.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const tables = [
      "conversations",
      "messages",
      "submissions",
      "assessments",
      "opportunity_reports",
      "engineering_briefs",
      "internal_notes",
      "notifications",
      "admin_users",
      "status_history",
    ];
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      for (const table of tables)
        await assert.rejects(
          db.query(`select * from public.${table}`),
          /permission denied/,
        );
      await assert.rejects(
        db.query(`select public.take_rate_limit('bad',1,60)`),
        /permission denied/,
      );
      await db.exec("reset role");
    }
    const {
      rows: [c],
    } = await db.query<{ id: string }>(
      `insert into public.conversations(token_hash) values('test-hash') returning id`,
    );
    const client = randomUUID(),
      lease = randomUUID();
    const call = async (sql: string, params: unknown[] = []) => {
      const r = await db.query<Record<string, unknown>>(sql, params);
      return Object.values(r.rows[0] || {})[0];
    };
    assert.equal(
      await call("select public.begin_turn($1,$2,$3,$4)", [
        c.id,
        client,
        "I need a better workflow",
        lease,
      ]),
      "ready",
    );
    assert.equal(
      await call("select public.begin_turn($1,$2,$3,$4)", [
        c.id,
        client,
        "I need a better workflow",
        randomUUID(),
      ]),
      "busy",
    );
    await db.query("select public.release_conversation($1,$2)", [c.id, lease]);
    assert.equal(
      await call("select public.begin_turn($1,$2,$3,$4)", [
        c.id,
        client,
        "I need a better workflow",
        lease,
      ]),
      "ready",
    );
    assert.equal(await call("select count(*)::int from public.messages"), 1);
    const assessment = {
      enough_information: true,
      request_type: "Individual",
      problem_summary: "A better workflow",
      desired_outcome: "Less repetitive work",
    };
    await db.query("select public.finish_turn($1,$2,$3,$4,$5)", [
      c.id,
      client,
      lease,
      "Who would use it?",
      assessment,
    ]);
    assert.equal(
      await call("select public.begin_turn($1,$2,$3,$4)", [
        c.id,
        client,
        "I need a better workflow",
        randomUUID(),
      ]),
      "done",
    );
    const submitLease = randomUUID();
    assert.equal(
      await call("select public.lock_submission($1,$2)", [c.id, submitLease]),
      true,
    );
    const contact = {
      name: "Test Person",
      email: "test@example.com",
      phone: "+60123456789",
      company: "",
      consent: true,
    };
    const opportunity = {
      internal_priority: "High",
      potential_business_value: "High",
      implementation_complexity: "Unknown",
    };
    await assert.rejects(
      db.query("select public.submit_request($1,$2,$3,$4,$5,$6)", [
        c.id,
        submitLease,
        { ...contact, consent: false },
        assessment,
        opportunity,
        {},
      ]),
      /Consent required/,
    );
    assert.equal(await call("select count(*)::int from public.submissions"), 0);
    const reference = await call(
      "select public.submit_request($1,$2,$3,$4,$5,$6)",
      [
        c.id,
        submitLease,
        contact,
        assessment,
        opportunity,
        { problem_idea: "A better workflow" },
      ],
    );
    assert.match(String(reference), /^ANM-\d{4}-\d{6}$/);
    assert.equal(
      await call("select public.submit_request($1,$2,$3,$4,$5,$6)", [
        c.id,
        submitLease,
        contact,
        assessment,
        opportunity,
        {},
      ]),
      reference,
    );
    assert.equal(await call("select count(*)::int from public.submissions"), 1);
    assert.equal(
      await call("select count(*)::int from public.opportunity_reports"),
      1,
    );
    assert.equal(
      await call("select count(*)::int from public.engineering_briefs"),
      1,
    );
    assert.equal(
      await call("select count(*)::int from public.notifications"),
      2,
    );
    const id = await call("select id from public.submissions");
    await db.query("select public.request_consultation($1)", [id]);
    await db.query("select public.request_consultation($1)", [id]);
    assert.equal(
      await call(
        "select count(*)::int from public.notifications where kind='CONSULTATION'",
      ),
      1,
    );
    assert.equal(
      await call("select public.take_rate_limit('test',1,60)"),
      true,
    );
    assert.equal(
      await call("select public.take_rate_limit('test',1,60)"),
      false,
    );
    await assert.rejects(
      db.query("select public.update_request_status($1,$2,'WON',null)", [
        id,
        randomUUID(),
      ]),
      /Not authorized/,
    );
    const admin = randomUUID();
    await db.query("insert into auth.users values($1)", [admin]);
    await db.query(
      "insert into public.admin_users(id,display_name) values($1,'Reviewer')",
      [admin],
    );
    await db.query(
      "select public.update_request_status($1,$2,'ENGINEERING REVIEW',$2)",
      [id, admin],
    );
    assert.equal(
      await call("select count(*)::int from public.status_history"),
      2,
    );
  } finally {
    await db.close();
  }
});
