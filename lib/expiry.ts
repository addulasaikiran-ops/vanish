export const EXPIRY_OPTIONS = [
  { value: "10m", label: "10 minutes", milliseconds: 10 * 60 * 1000 },
  { value: "1h", label: "1 hour", milliseconds: 60 * 60 * 1000 },
  { value: "24h", label: "24 hours", milliseconds: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "7 days", milliseconds: 7 * 24 * 60 * 60 * 1000 },
] as const;

export type ExpiryValue = (typeof EXPIRY_OPTIONS)[number]["value"];

export function getExpiryMilliseconds(value: unknown): number | null {
  if (typeof value !== "string") return null;
  return EXPIRY_OPTIONS.find((option) => option.value === value)?.milliseconds ?? null;
}

export function getExpiryLabel(value: string): string {
  return EXPIRY_OPTIONS.find((option) => option.value === value)?.label ?? "Custom";
}
