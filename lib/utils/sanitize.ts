const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const HTML_TAGS = /<[^>]*>/g;
const MULTI_SPACE = /\s+/g;

type SanitizeOptions = {
  maxLength?: number;
  preserveNewLines?: boolean;
};

export function sanitizeText(value: unknown, options: SanitizeOptions | number = {}) {
  const normalizedOptions = typeof options === "number" ? { maxLength: options } : options;
  const { maxLength = 500, preserveNewLines = false } = normalizedOptions;

  if (typeof value !== "string") {
    return "";
  }

  const normalized = value
    .normalize("NFKC")
    .replace(HTML_TAGS, "")
    .replace(CONTROL_CHARS, preserveNewLines ? " " : "")
    .replace(preserveNewLines ? /\r/g : MULTI_SPACE, preserveNewLines ? "" : " ")
    .trim();

  return normalized.slice(0, maxLength);
}

export function sanitizeNote(value: unknown, maxLength = 280) {
  return sanitizeText(value, { maxLength });
}

export function sanitizeTitle(value: unknown, maxLength = 120) {
  return sanitizeText(value, { maxLength });
}

export function sanitizeCategory(value: unknown) {
  return sanitizeText(value, { maxLength: 64 }).toLowerCase();
}

export function sanitizeSearchQuery(value: unknown, maxLength = 120) {
  return sanitizeText(value, { maxLength });
}

export function parsePositiveAmount(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

export function isValidDateString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}
