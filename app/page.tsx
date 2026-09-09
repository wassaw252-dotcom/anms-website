import { Brand } from "@/components/brand";
import { Hero } from "@/components/hero/hero";
import { siteUrl } from "@/lib/config";
export const metadata = {
  alternates: siteUrl() ? { canonical: siteUrl() } : undefined,
};
export default function Home() {
  return (
    <>
      <header className="navigation home-navigation"><Brand engineered /></header>
      <main id="main"><Hero /></main>
    </>
  );
}
