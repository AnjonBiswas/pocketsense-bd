import {
  addMonths,
  format,
  isSameMonth,
  isTomorrow,
  parseISO,
  startOfMonth
} from "date-fns";

export const INCOME_SOURCES = {
  allowance: {
    value: "allowance",
    en: "Allowance",
    bn: "ভাতা",
    icon: "💸",
    color: "#10B981"
  },
  tuition: {
    value: "tuition",
    en: "Tuition",
    bn: "টিউশন",
    icon: "📚",
    color: "#3B82F6"
  },
  freelance: {
    value: "freelance",
    en: "Freelance",
    bn: "ফ্রিল্যান্স",
    icon: "💻",
    color: "#F59E0B"
  },
  gift: {
    value: "gift",
    en: "Gift",
    bn: "উপহার",
    icon: "🎁",
    color: "#EC4899"
  },
  other: {
    value: "other",
    en: "Other",
    bn: "অন্যান্য",
    icon: "✨",
    color: "#8B5CF6"
  }
} as const;

export type IncomeSource = keyof typeof INCOME_SOURCES;

export type IncomeRecord = {
  id: string;
  amount: number;
  source: string;
  date: string;
  note: string | null;
  is_recurring: boolean;
  created_at: string;
};

export type TuitionStudentSummary = {
  name: string;
  amountPerMonth: number;
  lastPaymentDate: string | null;
  nextDueDate: string | null;
  paidThisMonth: boolean;
  reminderText: string;
};

export function getIncomeSourceMeta(source: string) {
  return INCOME_SOURCES[source as IncomeSource] || INCOME_SOURCES.other;
}

export function calculateTotalIncome(incomes: IncomeRecord[], month = new Date()) {
  return incomes
    .filter((income) => isSameMonth(parseISO(income.date), month))
    .reduce((sum, income) => sum + Number(income.amount), 0);
}

export function getIncomeBySource(incomes: IncomeRecord[], source: string) {
  return incomes
    .filter((income) => income.source === source)
    .reduce((sum, income) => sum + Number(income.amount), 0);
}

export function predictNextIncome(recurringIncomes: IncomeRecord[]) {
  return recurringIncomes
    .filter((income) => income.is_recurring)
    .map((income) => ({
      ...income,
      predictedDate: format(addMonths(parseISO(income.date), 1), "yyyy-MM-dd")
    }))
    .sort((left, right) => left.predictedDate.localeCompare(right.predictedDate));
}

function extractStudentName(note: string | null) {
  if (!note) return "Unnamed Student";

  const studentPrefix = /^student\s*:\s*/i;
  return note.replace(studentPrefix, "").trim() || "Unnamed Student";
}

export function buildTuitionTracker(incomes: IncomeRecord[], today = new Date()): TuitionStudentSummary[] {
  const tuitionIncomes = incomes.filter((income) => income.source === "tuition");
  const startOfCurrentMonth = startOfMonth(today);

  const byStudent = tuitionIncomes.reduce<Record<string, IncomeRecord[]>>((accumulator, income) => {
    const key = extractStudentName(income.note);
    accumulator[key] = [...(accumulator[key] || []), income].sort((left, right) =>
      right.date.localeCompare(left.date)
    );
    return accumulator;
  }, {});

  return Object.entries(byStudent)
    .map(([name, records]) => {
      const latest = records[0];
      const latestDate = parseISO(latest.date);
      const nextDueDate = addMonths(latestDate, 1);
      const paidThisMonth = latestDate >= startOfCurrentMonth;

      return {
        name,
        amountPerMonth: Number(latest.amount),
        lastPaymentDate: latest.date,
        nextDueDate: format(nextDueDate, "yyyy-MM-dd"),
        paidThisMonth,
        reminderText: isTomorrow(nextDueDate)
          ? `Tuition payment due from ${name} tomorrow`
          : paidThisMonth
            ? `${name} paid this month`
            : `${name} payment is pending`
      };
    })
    .sort((left, right) => {
      if (left.paidThisMonth !== right.paidThisMonth) {
        return left.paidThisMonth ? 1 : -1;
      }

      return (left.nextDueDate || "").localeCompare(right.nextDueDate || "");
    });
}

