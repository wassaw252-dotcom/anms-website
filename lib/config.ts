export const brand = {
  name: "ANM’s",
  meaning: "Advancing New Milestones",
  category: "Business Systems Engineering",
};
export function whatsappUrl(reference?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
    /[^0-9]/g,
    "",
  );
  if (!number || !/^[1-9]\d{7,14}$/.test(number)) return null;
  const message = reference
    ? `Hi ANM’s, I’d like to arrange a direct engineering consultation regarding request ${reference}.`
    : "Hi ANM’s, I’d like to discuss a project/problem with your team.";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
export function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  return url ? new URL(url).origin : undefined;
}
