"use client";
import { useEffect, useState } from "react";
const events = [
  "Request detected.",
  "Information processed.",
  "Workflow initiated.",
  "Action completed.",
  "Human approval requested.",
  "Process completed.",
];
export function CommandCenter() {
  const [step, setStep] = useState(0),
    [running, setRunning] = useState(false),
    [module, setModule] = useState("Overview");
  useEffect(() => {
    if (!running || step >= 5) return;
    const timer = setTimeout(() => {
      if (!document.hidden) setStep((s) => s + 1);
    }, 1700);
    return () => clearTimeout(timer);
  }, [running, step]);
  return (
    <div className="command-center">
      <div className="command-top">
        <span className="mini-mark">A /</span>
        <strong>ANM’s SYSTEM COMMAND CENTER</strong>
        <span className="demo-label">DEMO ENVIRONMENT</span>
      </div>
      <div className="command-layout">
        <aside>
          <span className="eyebrow">WORKSPACE</span>
          {["Overview", "Workflows", "Human approvals", "System health"].map(
            (x) => (
              <button
                className={module === x ? "selected" : ""}
                onClick={() => setModule(x)}
                key={x}
              >
                {x}
              </button>
            ),
          )}
          <span className="command-version">
            ILLUSTRATIVE SYSTEM
            <br />
            NO LIVE CUSTOMER DATA
          </span>
        </aside>
        <div className="command-body">
          <div className="command-heading">
            <div>
              <p className="eyebrow">OPERATIONS / {module.toUpperCase()}</p>
              <h3>
                {module === "Overview"
                  ? "A clearer view of every moving part."
                  : module}
              </h3>
            </div>
            <button
              className="button small"
              onClick={() => {
                setStep(0);
                setRunning(true);
              }}
            >
              {running ? "Replay workflow" : "Run demo"} <span>↗</span>
            </button>
          </div>
          <div className="metrics">
            <div>
              <span>ACTIVE WORKFLOWS</span>
              <strong>{running && step < 5 ? "01" : "00"}</strong>
              <small>Demo workflow</small>
            </div>
            <div>
              <span>PENDING ACTIONS</span>
              <strong>{running && step === 4 ? "01" : "00"}</strong>
              <small>
                {step === 4
                  ? "Human review required"
                  : "No demo actions pending"}
              </small>
            </div>
            <div>
              <span>COMPLETED TASKS</span>
              <strong>
                {running ? String(Math.min(step, 4)).padStart(2, "0") : "00"}
              </strong>
              <small>In this demonstration</small>
            </div>
          </div>
          {module === "Human approvals" ? (
            <div className="demo-detail">
              <h4>Human oversight stays in the process.</h4>
              <p>
                {running && step === 4
                  ? "A demonstration request is ready for human review."
                  : "Run the demo to see where approval is requested."}
              </p>
            </div>
          ) : module === "System health" ? (
            <div className="demo-detail">
              <h4>Service visibility</h4>
              <p>
                This environment illustrates health monitoring. No production
                services are connected to this demonstration.
              </p>
            </div>
          ) : (
            <div className="activity">
              <div className="activity-title">
                <span>SYSTEM ACTIVITY</span>
                <span>DEMO TIMELINE</span>
              </div>
              {events.map((event, i) => (
                <div
                  key={event}
                  className={`event ${running && i <= step ? "is-complete" : ""}`}
                >
                  <time>09:{["41", "42", "43", "44", "45", "47"][i]}</time>
                  <span className="event-node" />
                  <span>{event}</span>
                  <small>
                    {running && i <= step
                      ? i === 4
                        ? "HUMAN REVIEW"
                        : "PROCESSED"
                      : "WAITING"}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
