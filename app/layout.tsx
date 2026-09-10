import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/config";
const title = "ANM’s — Business Systems Engineering";
const description =
  "Your problem. Engineered into a solution. From a single idea to complex business operations, ANM’s engineers systems designed around what you need.";
export const metadata: Metadata = {
  metadataBase: siteUrl() ? new URL(siteUrl()!) : undefined,
  title: { default: title, template: "%s | ANM’s" },
  description,
  openGraph: { title, description, type: "website", siteName: "ANM’s" },
  twitter: { card: "summary", title, description },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
