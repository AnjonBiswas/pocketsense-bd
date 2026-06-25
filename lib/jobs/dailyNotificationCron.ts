export const notificationCronGuide = {
  dailyBudgetReminder: "Run daily at 9 AM to create budget notifications for active users.",
  dueBillsCheck: "Run daily at midnight to generate bill_due and tuition reminders.",
  weeklySummary: "Run every Monday morning to queue weekly email summaries."
} as const;

export async function runNotificationCronPreview() {
  return {
    success: true,
    jobs: notificationCronGuide
  };
}
