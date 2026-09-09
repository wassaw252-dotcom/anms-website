import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Wordmark } from "@/components/wordmark";
import { CommandCenter } from "@/components/command-center";
import { EngineeringFlow } from "@/components/engineering-flow";
import { Contact } from "@/components/contact";
import { Brand } from "@/components/brand";
import { siteUrl } from "@/lib/config";
export const metadata = {
  title: "What We Build | ANM’s",
  alternates: siteUrl() ? { canonical: `${siteUrl()}/what-we-build` } : undefined,
};
const capabilities = [
  ["Business systems", "Systems designed around actual operations."],
  ["Workflow engineering", "Redesign and automate repetitive processes."],
  ["Custom software", "Tools and platforms around unique requirements."],
  ["System integration", "Connect existing tools, systems and data."],
  ["Data & intelligence", "Turn operational information into useful insight."],
  ["Digital products", "Turn ideas into functioning products."],
  [
    "Intelligent automation",
    "Use appropriate technology to execute repetitive workflows.",
  ],
];
export default function WhatWeBuild() {
  return (
    <>
      <Navigation />
      <main id="main" className="company-page">
        <section className="company-intro wrap">
          <div>
            <p className="eyebrow">BUSINESS SYSTEMS ENGINEERING</p>
            <h1>REAL PROBLEMS.<br />CUSTOM SYSTEMS.<br /><span className="gold-text">LASTING PROGRESS.</span></h1>
            <p>From a single idea to complex business operations, ANM’s engineers systems designed around what you need.</p>
            <Link href="/discovery" className="button gold">TELL US YOUR PROBLEM <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="company-monument" aria-hidden="true">
            <Wordmark />
            <p>ADVANCING NEW MILESTONES</p>
            <span>PEOPLE<br />PROCESSES<br />TECHNOLOGY</span>
          </div>
        </section>
        <div className="audiences wrap">
          {[
            ["01", "INDIVIDUALS", "Turn ideas into reality."],
            ["02", "BUSINESSES", "Operate smarter."],
            ["03", "GROWING COMPANIES", "Scale efficiently."],
            ["04", "ENTERPRISE", "Engineer what’s next."],
          ].map(([n, title, copy]) => (
            <div key={n}>
              <span className="audience-num">{n} /</span>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          ))}
        </div>
        <section id="solutions" className="section wrap problem-section">
          <div className="section-index">
            <span>01 / A BETTER WAY</span>
            <span>RETHINK THE PROCESS</span>
          </div>
          <div className="split">
            <div>
              <p className="eyebrow">PEOPLE DO MORE WHEN SYSTEMS DO BETTER.</p>
              <h2>
                SOMETIMES YOU
                <br />
                DON’T NEED
                <br />
                MORE PEOPLE.
                <br />
                <span className="gold-text">
                  YOU NEED A<br />
                  BETTER SYSTEM.
                </span>
              </h2>
            </div>
            <div className="problem-copy">
              <p>
                More customers. More enquiries. More administration. More
                coordination.
              </p>
              <p>
                As organizations grow, repetitive work grows with them. Before
                adding more people to a process, understand whether the process
                itself can work better.
              </p>
              <div className="process-list">
                {[
                  "Repeated customer enquiries",
                  "Data entry & document processing",
                  "Lead follow-up & scheduling",
                  "Reporting & monitoring",
                  "Internal requests & coordination",
                ].map((x, i) => (
                  <div key={x}>
                    <span>0{i + 1}</span>
                    {x}
                    <span aria-hidden="true">↗</span>
                  </div>
                ))}
              </div>
              <p className="manifesto">
                AUTOMATE THE REPETITIVE.
                <br />
                KEEP PEOPLE FOCUSED ON WHAT MATTERS.
              </p>
            </div>
          </div>
        </section>
        <section className="section ideas-section">
          <div className="wrap">
            <div className="section-index">
              <span>02 / START WITH WHAT MATTERS</span>
              <span>NO TECHNICAL BRIEF REQUIRED</span>
            </div>
            <h2>
              WHAT DO YOU
              <br />
              WANT TO <span className="gold-text">BUILD?</span>
            </h2>
            <div className="ideas-grid">
              {[
                "I have an idea but don’t know how to build it.",
                "We need an internal system.",
                "Our current workflow is inefficient.",
                "We need our existing systems to communicate.",
                "We want to automate this process.",
                "We need a custom platform.",
                "We have a problem nobody has solved properly.",
              ].map((x) => (
                <Link href="/discovery" key={x}>
                  <span>“{x}”</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
            <Link className="text-link gold-text" href="/discovery">
              BRING IT TO US. <span>↗</span>
            </Link>
          </div>
        </section>
        <section id="capabilities" className="section wrap">
          <div className="section-index">
            <span>03 / ENGINEERING DISCIPLINES</span>
            <span>THE RIGHT TOOLS. THE RIGHT REASON.</span>
          </div>
          <div className="section-intro">
            <h2>
              BUILT TO SOLVE.
              <br />
              <span className="muted">DESIGNED TO FIT.</span>
            </h2>
            <p>
              You bring the problem. We investigate the requirements,
              constraints and possibilities.
            </p>
          </div>
          <div className="capability-list">
            {capabilities.map(([title, copy], i) => (
              <div key={title}>
                <span className="cap-num">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="cap-symbol" aria-hidden="true">
                  {["⊞", "⌁", "⌘", "⋈", "▥", "◇", "↗"][i]}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="section custom-section">
          <div className="wrap">
            <p className="eyebrow">NOT A TEMPLATE. NOT A PLUG-IN.</p>
            <h2>
              BUILT AROUND
              <br />
              HOW YOU <span className="gold-text">ACTUALLY WORK.</span>
            </h2>
            <EngineeringFlow />
          </div>
        </section>
        <section id="work" className="section wrap">
          <div className="section-index">
            <span>04 / A SYSTEM IN MOTION</span>
            <span>ILLUSTRATIVE PRODUCT EXPERIENCE</span>
          </div>
          <div className="section-intro">
            <h2>
              COMPLEXITY,
              <br />
              <span className="gold-text">UNDER CONTROL.</span>
            </h2>
            <p>
              Explore how a custom operational system could bring workflows,
              actions and human decisions into one place. This is a
              demonstration, not client work.
            </p>
          </div>
          <CommandCenter />
        </section>
        <section id="how-it-works" className="section wrap">
          <div className="section-index">
            <span>05 / FROM PROBLEM TO PROGRESS</span>
            <span>ENGINEERING STARTS WITH UNDERSTANDING</span>
          </div>
          <h2>
            YOU BRING THE PROBLEM.
            <br />
            <span className="gold-text">WE ENGINEER THE SOLUTION.</span>
          </h2>
          <div className="steps">
            {[
              ["TELL US", "Explain your problem or idea."],
              ["DISCOVERY", "We understand what you want to achieve."],
              [
                "ASSESSMENT",
                "We identify opportunities, requirements and constraints.",
              ],
              [
                "ENGINEERING REVIEW",
                "Our engineers assess technical feasibility.",
              ],
              [
                "PROPOSED DIRECTION",
                "ANM’s returns with the recommended next step.",
              ],
              ["BUILD", "Once approved, we engineer the solution."],
            ].map(([title, copy], i) => (
              <div key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="about" className="section about-section">
          <div className="wrap split">
            <div>
              <p className="eyebrow">ANM’s / ADVANCING NEW MILESTONES</p>
              <h2>
                REAL PROBLEMS.
                <br />
                PRACTICAL SOLUTIONS.
                <br />
                <span className="gold-text">LASTING PROGRESS.</span>
              </h2>
            </div>
            <div>
              <p>Good engineering begins with a better question.</p>
              <p>
                What are you trying to achieve? What’s getting in the way? And
                what would make a meaningful difference?
              </p>
              <p>
                From individuals with a new idea to enterprise teams with
                complex operations, ANM’s starts by understanding the need.
                Every direction is subject to human engineering review.
              </p>
            </div>
          </div>
        </section>
        <section className="final-cta wrap">
          <span className="eyebrow">YOUR NEXT MILESTONE STARTS HERE.</span>
          <h2>
            BRING US
            <br />
            <span className="gold-text">THE PROBLEM.</span>
          </h2>
          <div className="hero-actions">
            <Link className="button gold" href="/discovery">
              TRY US! <span>↗</span>
            </Link>
            <Contact className="text-link" />
          </div>
        </section>
      </main>
      <footer className="footer wrap">
        <Brand engineered />
        <p>
          IDEAS <span>×</span> SYSTEMS <span>×</span> PROGRESS
        </p>
        <div>
          <Link href="/privacy">Privacy & data</Link>
          <Link href="/dashboard">Team access</Link>
        </div>
        <small>© {new Date().getFullYear()} ANM’s</small>
      </footer>
    </>
  );
}
