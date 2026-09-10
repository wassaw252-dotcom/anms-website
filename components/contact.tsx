import { whatsappUrl } from "@/lib/config";
export function Contact({
  className = "",
  label = "TALK TO US",
  reference,
}: {
  className?: string;
  label?: string;
  reference?: string;
}) {
  const url = whatsappUrl(reference);
  return url ? (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label} <span aria-hidden="true">↗</span>
    </a>
  ) : (
    <span
      className={`${className} unavailable`}
      title="Direct contact is not available yet"
    >
      Direct contact coming soon
    </span>
  );
}
