import { Brand } from "@/components/brand";
import { Hero } from "@/components/hero/hero";
import { Navigation } from "@/components/navigation";
import { siteUrl } from "@/lib/config";
export const metadata = {
  alternates: siteUrl() ? { canonical: siteUrl() } : undefined,
};
export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main"><Hero /></main>
      <footer className="home-footer wrap"><Brand engineered /><p>IDEAS × SYSTEMS × PROGRESS</p><small>A BETTER TOMORROW.<br />TOGETHER.</small></footer>
    </>
  );
}
