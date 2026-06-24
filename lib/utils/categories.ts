export const CATEGORIES = {
  food: { en: "Food", bn: "খাবার", icon: "🍔", color: "#FF6384" },
  transport: { en: "Transport", bn: "যাতায়াত", icon: "🚕", color: "#36A2EB" },
  cafe: { en: "Cafe & Hangouts", bn: "ক্যাফে", icon: "☕", color: "#FFCE56" },
  cigarettes: { en: "Cigarettes", bn: "সিগারেট", icon: "🚬", color: "#FF9F40" },
  mobile: { en: "Mobile Recharge", bn: "মোবাইল রিচার্জ", icon: "📱", color: "#4BC0C0" },
  clothing: { en: "Clothing", bn: "পোশাক", icon: "👕", color: "#9966FF" },
  entertainment: { en: "Entertainment", bn: "বিনোদন", icon: "🎬", color: "#FF6B6B" },
  gifts: { en: "Gifts", bn: "উপহার", icon: "🎁", color: "#C084FC" },
  health: { en: "Health", bn: "স্বাস্থ্য", icon: "💊", color: "#10B981" },
  other: { en: "Other", bn: "অন্যান্য", icon: "🧾", color: "#94A3B8" }
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export function getCategoryMeta(category: string) {
  return CATEGORIES[(category as CategoryKey) || "other"] || CATEGORIES.other;
}
