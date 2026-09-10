import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/dashboard/login-form";
import { authReady, getAdmin } from "@/services/database/auth";
import { databaseReady } from "@/services/database/client";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Team sign-in",
  robots: { index: false, follow: false },
};
export default async function Login() {
  const ready = authReady() && databaseReady();
  if (ready && (await getAdmin())) redirect("/dashboard");
  return (
    <>
      <header className="page-header">
        <Brand />
      </header>
      <main id="main" className="login">
        <p className="eyebrow">ANM’s / AUTHORIZED TEAM ACCESS</p>
        <h1>
          Engineering starts
          <br />
          with understanding.
        </h1>
        <p>Sign in to review requests and prepare the next step.</p>
        {ready ? (
          <LoginForm />
        ) : (
          <p className="notice">
            Team access is awaiting configuration. No internal data is available
            publicly.
          </p>
        )}
      </main>
    </>
  );
}
