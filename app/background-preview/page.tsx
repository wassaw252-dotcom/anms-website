import BackgroundStudy from "@/components/hero/background-study";
import styles from "./study.module.css";

export const metadata = { title: "Background study", robots: { index: false, follow: false } };

export default function BackgroundPreview() {
  return <main id="main" className={styles.scene} aria-label="Animated Earth and orbital background"><BackgroundStudy /></main>;
}
