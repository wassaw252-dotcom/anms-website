import { DiscoveryExperience } from "@/components/discovery/discovery-experience";
export const metadata = {
  title: "Discovery",
  robots: { index: false, follow: false },
};
export default function Discovery() {
  return <DiscoveryExperience />;
}
