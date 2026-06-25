import { endOfMonth, formatDistanceToNow, isToday, isYesterday, startOfMonth } from "date-fns";
import type { Alert, BudgetRecord, DebtRecord, ReminderRecord } from "@/lib/utils/alerts";
import type { BudgetExpense } from "@/lib/utils/budget";
import type { IncomeRecord } from "@/lib/utils/income";
import { calculateDailyBudget, calculateSpendingVelocity } from "@/lib/utils/budget";
import type { Database } from "@/types/database.types";

export type NotificationType = Database["public"]["Tables"]["notifications"]["Row"]["type"];
export type NotificationRecord = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationPreference = Database["public"]["Tables"]["notification_preferences"]["Row"];

export type NotificationGenerationInput = {
  userId: string;
  expenses: BudgetExpense[];
  incomes: IncomeRecord[];
  budget: BudgetRecord;
  reminders?: ReminderRecord[];
  debts?: DebtRecord[];
  alerts?: Alert[];
  streak?: number;
  completedChallenges?: number;
  currentDate: Date;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<
  NotificationPreference,
  "id" | "user_id" | "created_at" | "updated_at"
> = {
  daily_budget: true,
  overspending: true,
  bill_due: true,
  tuition: true,
  friend_owed: true,
  challenge_completion: true,
  streak_milestone: true,
  month_end_summary: true,
  push_enabled: false,
  email_enabled: false,
  sms_enabled: false,
  frequency: "immediate"
};

function mapTypeToPreferenceKey(type: NotificationType) {
  const mapping = {
    daily_budget: "daily_budget",
    overspending: "overspending",
    bill_due: "bill_due",
    tuition: "tuition",
    friend_owed: "friend_owed",
    challenge_completion: "challenge_completion",
    streak_milestone: "streak_milestone",
    month_end_summary: "month_end_summary",
    sos: "overspending",
    info: "daily_budget"
  } as const;

  return mapping[type];
}

export function buildNotification(
  input: Pick<NotificationRecord, "user_id" | "type" | "title" | "message"> & {
    action_url?: string | null;
    read?: boolean;
  }
): Database["public"]["Tables"]["notifications"]["Insert"] {
  return {
    user_id: input.user_id,
    type: input.type,
    title: input.title,
    message: input.message,
    action_url: input.action_url || null,
    read: input.read || false
  };
}

export function generateNotifications(input: NotificationGenerationInput) {
  const notifications: Database["public"]["Tables"]["notifications"]["Insert"][] = [];
  const today = input.currentDate;
  const daysRemaining = Math.max(endOfMonth(today).getDate() - today.getDate(), 1);
  const monthStart = startOfMonth(today).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(today).toISOString().slice(0, 10);
  const currentMonthExpenses = input.expenses.filter(
    (expense) => expense.date >= monthStart && expense.date <= monthEnd
  );
  const currentMonthIncomes = input.incomes.filter(
    (income) => income.date >= monthStart && income.date <= monthEnd
  );
  const totalIncome = currentMonthIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const recurringIncome = currentMonthIncomes
    .filter((income) => income.is_recurring)
    .reduce((sum, income) => sum + Number(income.amount), 0);
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const dailyBudget = calculateDailyBudget({
    totalIncome,
    recurringIncome,
    totalExpenses,
    savingsGoal: Number(input.budget.savings_goal || 0),
    emergencyReserve: Number(input.budget.emergency_reserve || 0),
    daysInMonth: endOfMonth(today).getDate(),
    currentDay: today.getDate()
  });
  const velocity = calculateSpendingVelocity(currentMonthExpenses, startOfMonth(today), today);

  notifications.push(
    buildNotification({
      user_id: input.userId,
      type: "daily_budget",
      title: "আজকের বাজেট রিমাইন্ডার",
      message: `আজ নিরাপদ খরচ সীমা প্রায় ৳${dailyBudget.toFixed(0)}।`,
      action_url: "/dashboard"
    })
  );

  if (velocity > dailyBudget && totalExpenses > 0) {
    notifications.push(
      buildNotification({
        user_id: input.userId,
        type: "overspending",
        title: "খরচ একটু বেশি হচ্ছে",
        message: `আপনি দৈনিক গড়ে ৳${velocity.toFixed(0)} খরচ করছেন। একটু ধীরে চলুন।`,
        action_url: "/dashboard/reports"
      })
    );
  }

  const upcomingBill = (input.reminders || []).find(
    (reminder) => reminder.kind === "bill" && reminder.status === "pending"
  );
  if (upcomingBill) {
    notifications.push(
      buildNotification({
        user_id: input.userId,
        type: "bill_due",
        title: "বিলের সময় চলে এসেছে",
        message: `${upcomingBill.title} আগামীকাল পরিশোধ করতে হবে।`,
        action_url: "/dashboard"
      })
    );
  }

  const tuitionReminder = (input.reminders || []).find(
    (reminder) => reminder.kind === "tuition" && reminder.status === "pending"
  );
  if (tuitionReminder) {
    notifications.push(
      buildNotification({
        user_id: input.userId,
        type: "tuition",
        title: "টিউশনের পেমেন্ট রিমাইন্ডার",
        message: `${tuitionReminder.title} কাল collect করতে ভুলবেন না।`,
        action_url: "/dashboard/income"
      })
    );
  }

  const debtReminder = (input.debts || []).find(
    (debt) => debt.status === "pending" && debt.direction === "owed_to_me"
  );
  if (debtReminder) {
    notifications.push(
      buildNotification({
        user_id: input.userId,
        type: "friend_owed",
        title: "বন্ধুর কাছে টাকা পাওনা আছে",
        message: `${debtReminder.friend_name} এখনও ৳${debtReminder.amount.toFixed(0)} দেয়নি।`,
        action_url: "/dashboard/squads"
      })
    );
  }

  if ((input.completedChallenges || 0) > 0) {
    notifications.push(
      buildNotification({
        user_id: input.userId,
        type: "challenge_completion",
        title: "চ্যালেঞ্জ সম্পন্ন হয়েছে",
        message: `অভিনন্দন! আপনি ${input.completedChallenges}টি চ্যালেঞ্জ শেষ করেছেন।`,
        action_url: "/dashboard/challenges"
      })
    );
  }

  if ((input.streak || 0) >= 7) {
    notifications.push(
      buildNotification({
        user_id: input.userId,
        type: "streak_milestone",
        title: "স্ট্রিক মাইলস্টোন",
        message: `${input.streak} দিনের streak চলছে। Keep it up!`,
        action_url: "/dashboard/challenges"
      })
    );
  }

  if (daysRemaining <= 3) {
    notifications.push(
      buildNotification({
        user_id: input.userId,
        type: "month_end_summary",
        title: "মাস শেষের সারাংশ",
        message: `এই মাসে আয় ৳${totalIncome.toFixed(0)} আর খরচ ৳${totalExpenses.toFixed(0)}।`,
        action_url: "/dashboard/reports"
      })
    );
  }

  return notifications;
}

export function filterNotificationsByPreference(
  notifications: Database["public"]["Tables"]["notifications"]["Insert"][],
  preference?: Partial<NotificationPreference> | null
) {
  if (!preference) {
    return notifications;
  }

  return notifications.filter((notification) => {
    const key = mapTypeToPreferenceKey(notification.type);
    return preference[key] !== false;
  });
}

export function getNotificationDateGroup(date: string) {
  const parsed = new Date(date);
  if (isToday(parsed)) return "Today";
  if (isYesterday(parsed)) return "Yesterday";
  return "Earlier";
}

export function formatNotificationTimeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
