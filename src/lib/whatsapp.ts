import { studio, type BookingFunction } from "@/content/site";

/** Digits-only WhatsApp number from the env (preferred) or site.ts, or null when not set yet. */
export function whatsappNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || studio.whatsappNumber || "";
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

/**
 * The one helper that builds every WhatsApp link. Without a number it opens WhatsApp in share
 * mode (https://wa.me/?text=...), so the composed message still works in the demo.
 */
export function waLink(message: string): string {
  const number = whatsappNumber();
  const text = encodeURIComponent(message);
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

export const waMessages = {
  general: "Hi Ashugraphy! We'd love to check if you're available for our wedding.",
  service: (enquiry: string) =>
    `Hi Ashugraphy! We'd like to know more about ${enquiry}. Could you share your availability?`,
  booking: ({
    names,
    date,
    city,
    functions,
  }: {
    names: string;
    date: string;
    city: string;
    functions: readonly BookingFunction[];
  }) =>
    `Hi Ashugraphy! We're ${names}. Our wedding is on ${date} in ${city}. ` +
    `Functions: ${functions.length > 0 ? functions.join(", ") : "to be decided"}. ` +
    "Could you share your availability?",
};

/** "2027-02-14" becomes "14 February 2027". */
export function formatWeddingDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
