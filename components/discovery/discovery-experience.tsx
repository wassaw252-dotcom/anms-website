"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Brand } from "@/components/brand";
import { Contact } from "@/components/contact";
import { whatsappUrl } from "@/lib/config";
type Turn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  client_id: string | null;
};
type Assessment = {
  problem_summary: string;
  desired_outcome: string;
  enough_information: boolean;
};
type Session = {
  available?: boolean;
  messages: Turn[];
  assessment: Assessment | null;
  submitted: { reference: string; consultation_requested: boolean } | null;
};
const initial: Session = { messages: [], assessment: null, submitted: null };
export function DiscoveryExperience() {
  const [data, setData] = useState<Session>(initial),
    [draft, setDraft] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [pending, setPending] = useState<{ id: string; message: string } | null>(
      null,
    ),
    [submitting, setSubmitting] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  async function load() {
    const response = await fetch("/api/discovery/session", {
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setData(result);
    const last = result.messages?.at(-1);
    if (last?.role === "user" && last.client_id)
      setPending({ id: last.client_id, message: last.content });
    return result as Session;
  }
  useEffect(() => {
    let cancelled = false;
    fetch("/api/discovery/session", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result as Session;
      })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        const last = result.messages.at(-1);
        if (last?.role === "user" && last.client_id)
          setPending({ id: last.client_id, message: last.content });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (data.messages.length)
      bottom.current?.scrollIntoView({
        behavior: reduced ? "instant" : "smooth",
        block: "end",
      });
  }, [data.messages.length, busy, reduced]);
  async function send(e: FormEvent) {
    e.preventDefault();
    if (busy || (!draft.trim() && !pending)) return;
    setBusy(true);
    setError("");
    const input = pending || { id: crypto.randomUUID(), message: draft.trim() };
    setPending(input);
    try {
      const start = await fetch("/api/discovery/session", { method: "POST" });
      const session = await start.json();
      if (!start.ok) throw new Error(session.error);
      const response = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.saved) await load();
        throw new Error(result.error);
      }
      setData({ ...result, available: true });
      setDraft("");
      setPending(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/discovery/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          company: form.get("company") || "",
          consent: form.get("consent") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData((d) => ({
        ...d,
        submitted: {
          reference: result.reference,
          consultation_requested: false,
        },
      }));
      window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your request could not be submitted. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  async function consultation() {
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/discovery/consultation", {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      window.location.assign(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const ready = data.assessment?.enough_information && !pending;
  return (
    <div className="discovery-page">
      <header className="page-header">
        <Brand />
        <Link href="/">← Back to ANM’s</Link>
      </header>
      <main id="main" className="discovery-shell">
        <div className="discovery-topline">
          <span>ANM’s / DISCOVERY EXPERIENCE</span>
          <span>
            {data.submitted
              ? "REQUEST PREPARED"
              : ready
                ? "02 / REVIEW YOUR REQUEST"
                : "01 / UNDERSTANDING YOUR NEED"}
          </span>
        </div>
        <div className="discovery-orbit" aria-hidden="true" />
        {data.submitted ? (
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>
              ASSESSMENT
              <br />
              <span className="gold-text">RECEIVED.</span>
            </h1>
            <p>
              Thank you. We have enough information to begin reviewing your
              request.
            </p>
            <div className="receipt">
              <p className="eyebrow">AWAITING ENGINEERING REVIEW</p>
              <span className="eyebrow">REQUEST REFERENCE</span>
              <div className="receipt-reference">
                {data.submitted.reference}
              </div>
              <p>
                Our engineers will review the problem, requirements and
                technical feasibility before recommending the most suitable
                direction.
              </p>
              <p>
                Once the assessment is complete, we’ll get back to you with the
                proposed next step.
              </p>
              <div className="consultation">
                <h3>SPEAK DIRECTLY WITH AN ENGINEER</h3>
                <p>
                  Need a deeper discussion about your requirements? Arrange a
                  direct consultation with our engineering team.
                </p>
                <p>
                  This is a paid consultation. Fees, bank transfer details and
                  scheduling are arranged manually through WhatsApp.
                </p>
                {whatsappUrl(data.submitted.reference) ? (
                  <button
                    className="button gold"
                    onClick={consultation}
                    disabled={busy}
                  >
                    Arrange consultation ↗
                  </button>
                ) : (
                  <p className="notice">
                    Consultation contact is not available yet. Your standard
                    review request is saved.
                  </p>
                )}
              </div>
            </div>
            <Link href="/" className="text-link">
              RETURN TO ANM’s ↗
            </Link>
          </motion.div>
        ) : (
          <>
            <h1>
              TELL US WHAT
              <br />
              YOU’RE TRYING
              <br />
              <span className="gold-text">TO SOLVE.</span>
            </h1>
            <p className="intro-copy">
              You don’t need to know the technology. Just tell us what you want
              to improve, automate or build.
            </p>
            {loading ? (
              <p role="status" className="loading-status">
                OPENING YOUR DISCOVERY...
              </p>
            ) : data.available === false ? (
              <div className="notice">
                <p>
                  Discovery is not available yet. Please use direct contact when
                  available.
                </p>
                <Contact className="text-link" />
              </div>
            ) : (
              <>
                <div
                  className="transcript"
                  aria-live="polite"
                  aria-relevant="additions"
                >
                  {data.messages.map((turn) => (
                    <div className={`turn ${turn.role}`} key={turn.id}>
                      <span>
                        {turn.role === "user" ? "YOU" : "ANM’s / DISCOVERY"}
                      </span>
                      <p>{turn.content}</p>
                    </div>
                  ))}
                </div>
                {ready ? (
                  <>
                    <div className="summary-panel">
                      <p className="eyebrow">YOUR REQUEST / READY TO REVIEW</p>
                      <h2>Here’s what we understand.</h2>
                      <dl>
                        <dt>Problem or idea</dt>
                        <dd>{data.assessment?.problem_summary}</dd>
                        <dt>Desired outcome</dt>
                        <dd>{data.assessment?.desired_outcome}</dd>
                      </dl>
                      <button
                        className="text-link"
                        style={{
                          background: "none",
                          border: 0,
                          color: "var(--gold)",
                          padding: 0,
                        }}
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            assessment: d.assessment
                              ? { ...d.assessment, enough_information: false }
                              : null,
                          }))
                        }
                      >
                        Add or correct something ↗
                      </button>
                    </div>
                    <form onSubmit={submit}>
                      <h2 style={{ fontSize: 26 }}>
                        Where should we get back to you?
                      </h2>
                      <div className="fields">
                        <label className="field">
                          Name
                          <input
                            name="name"
                            autoComplete="name"
                            minLength={2}
                            maxLength={120}
                            required
                          />
                        </label>
                        <label className="field">
                          Email
                          <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            maxLength={254}
                            required
                          />
                        </label>
                        <label className="field">
                          Phone / WhatsApp
                          <input
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            minLength={7}
                            maxLength={25}
                            required
                          />
                        </label>
                        <label className="field">
                          Company <span className="muted">Optional</span>
                          <input
                            name="company"
                            autoComplete="organization"
                            maxLength={180}
                          />
                        </label>
                      </div>
                      <label className="consent">
                        <input type="checkbox" name="consent" required />
                        <span>
                          I agree to ANM’s processing this conversation and my
                          contact details for engineering review and follow-up,
                          as described in the{" "}
                          <Link href="/privacy" target="_blank">
                            privacy & data notice
                          </Link>
                          .
                        </span>
                      </label>
                      {submitting ? (
                        <p className="loading-status" role="status">
                          PREPARING YOUR REQUEST...
                          <br />
                          Please keep this page open.
                        </p>
                      ) : null}
                      <button className="button gold" disabled={submitting}>
                        SUBMIT FOR ENGINEERING REVIEW <span>↗</span>
                      </button>
                      <p style={{ fontSize: 12, marginTop: 18 }}>
                        Submitting starts the standard review path. No payment
                        is collected here.
                      </p>
                    </form>
                  </>
                ) : (
                  <>
                    <form className="composer" onSubmit={send}>
                      <label className="sr-only" htmlFor="problem">
                        Your problem or idea
                      </label>
                      <textarea
                        id="problem"
                        value={pending ? pending.message : draft}
                        onChange={(e) => setDraft(e.target.value)}
                        disabled={busy || !!pending}
                        placeholder="Describe your problem or idea in your own words..."
                        maxLength={4000}
                        required
                      />
                      <div className="composer-bottom">
                        <small>
                          {busy
                            ? "Understanding your request…"
                            : pending
                              ? "Your previous message is ready to retry."
                              : "One question at a time. In your own words."}
                        </small>
                        <button
                          className="button gold"
                          disabled={busy || (!draft.trim() && !pending)}
                        >
                          {busy ? "PREPARING…" : pending ? "RETRY" : "CONTINUE"}{" "}
                          <span>↗</span>
                        </button>
                      </div>
                    </form>
                    {!data.messages.length && !pending ? (
                      <div className="discovery-examples">
                        {[
                          "I have an idea.",
                          "My team loses time on repetitive work.",
                          "Our systems need to work together.",
                        ].map((x) => (
                          <button onClick={() => setDraft(x)} key={x}>
                            {x}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )}
          </>
        )}
        {error ? (
          <div role="alert" className="notice error-notice">
            {error}
            <div style={{ marginTop: 12 }}>
              <Contact className="text-link" label="TALK TO ANM’s" />
            </div>
          </div>
        ) : null}
        <div className="discovery-meta">
          <span>Automated discovery. Human engineering review.</span>
          <Link href="/privacy">Privacy & data</Link>
        </div>
        <p style={{ fontSize: 11, marginTop: 18, color: "#819078" }}>
          Please don’t share passwords, payment details or sensitive records.
        </p>
        <div ref={bottom} />
      </main>
    </div>
  );
}
