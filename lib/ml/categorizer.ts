export type SuggestedCategory = {
  category: string | null;
  confidence: number;
  matchedKeywords: string[];
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ["খাবার", "ভাত", "লাঞ্চ", "dinner", "breakfast", "meal", "canteen", "ভোজন"],
  transport: ["রিকশা", "বাস", "uber", "pathao", "transport", "যাতায়াত", "cng"],
  cafe: ["চা", "কফি", "coffee", "tea", "cafe", "ক্যাফে", "hangout"],
  cigarettes: ["সিগারেট", "cigarette", "smoke", "বিড়ি"],
  mobile: ["রিচার্জ", "মোবাইল", "mobile", "internet", "data", "flexiload"],
  clothing: ["জামা", "shirt", "pant", "cloth", "clothing", "fashion"],
  entertainment: ["movie", "cinema", "game", "netflix", "entertainment", "ঘুরতে"],
  gifts: ["gift", "উপহার", "present", "birthday"],
  health: ["medicine", "doctor", "health", "ওষুধ", "pharmacy"],
  other: ["misc", "other", "অন্যান্য"]
};

const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function normalizeBanglaDigits(value: string) {
  return value.replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)));
}

function normalizeText(text: string) {
  return normalizeBanglaDigits(text).toLowerCase().replace(/\s+/g, " ").trim();
}

export function suggestCategoryFromNote(note: string): SuggestedCategory {
  const normalized = normalizeText(note);

  if (!normalized) {
    return {
      category: null,
      confidence: 0,
      matchedKeywords: []
    };
  }

  const scored = Object.entries(CATEGORY_KEYWORDS)
    .map(([category, keywords]) => {
      const matchedKeywords = keywords.filter((keyword) => normalized.includes(normalizeText(keyword)));
      const confidence = Math.min(matchedKeywords.length / Math.max(keywords.length / 3, 1), 1);

      return {
        category,
        confidence: Number(confidence.toFixed(2)),
        matchedKeywords
      };
    })
    .sort((left, right) => right.confidence - left.confidence);

  return scored[0]?.confidence
    ? scored[0]
    : {
        category: null,
        confidence: 0,
        matchedKeywords: []
      };
}
