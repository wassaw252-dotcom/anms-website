import Link from "next/link";
import { Brand } from "@/components/brand";
import { Contact } from "@/components/contact";
export const metadata = { title: "Privacy & data" };
export default function Privacy() {
  return (
    <>
      <header className="page-header">
        <Brand />
        <Link href="/">Back to ANM’s ↗</Link>
      </header>
      <main id="main" className="legal wrap">
        <p className="eyebrow">PRIVACY & DATA / VERSION 1</p>
        <h1>
          Your information,
          <br />
          handled with purpose.
        </h1>
        <p>
          ANM’s uses the information you share to understand your request,
          prepare it for engineering review and contact you about next steps.
        </p>
        <h2>What we collect</h2>
        <p>
          Your discovery conversation, request summary, name, email, phone or
          WhatsApp number and, where applicable, company name. We also record
          your submission consent and request status.
        </p>
        <h2>How discovery works</h2>
        <p>
          The discovery experience is automated. It helps clarify and organize
          what you tell us. It does not represent a human engineering
          assessment. Our team reviews submitted requests before recommending a
          direction.
        </p>
        <h2>Where information is processed</h2>
        <p>
          Request information is processed using our hosting, database and
          configured intelligence service providers. Processing may take place
          outside your country. Authorized ANM’s team members can access
          submitted requests for review and follow-up.
        </p>
        <h2>Share only what is needed</h2>
        <p>
          Do not enter passwords, API keys, bank credentials, highly sensitive
          personal information or confidential records you are not authorized to
          share. Describe sensitive requirements at a high level first.
        </p>
        <h2>Sessions and access</h2>
        <p>
          An essential browser cookie keeps your discovery session available on
          the same browser for up to seven days. Keep shared devices secure.
          Internal assessment and engineering notes are restricted to authorized
          team members.
        </p>
        <h2>Retention and your choices</h2>
        <p>
          Request records remain available to support review and follow-up.
          Session expiry does not automatically delete those records. You may
          ask ANM’s to access, correct or delete your information. Our team will
          verify your identity and explain any retention requirements that
          apply.
        </p>
        <h2>Contact</h2>
        <p>
          Use ANM’s direct contact channel to discuss data handling or request
          deletion.
        </p>
        <Contact className="button" />
        <p style={{ marginTop: 30 }}>
          <Link href="/discovery">Return to discovery →</Link>
        </p>
      </main>
    </>
  );
}
