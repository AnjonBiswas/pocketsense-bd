type EmailNotificationType = "weekly_summary" | "month_end_report" | "emergency_low_balance";

export async function sendNotificationEmail(params: {
  to: string;
  type: EmailNotificationType;
  subject: string;
  html: string;
}) {
  const provider = process.env.RESEND_API_KEY ? "resend" : process.env.SENDGRID_API_KEY ? "sendgrid" : null;

  if (!provider) {
    return {
      success: false,
      reason: "No email provider configured."
    };
  }

  return {
    success: true,
    provider,
    preview: {
      to: params.to,
      subject: params.subject,
      type: params.type
    }
  };
}
