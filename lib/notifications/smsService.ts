type CriticalSMSNotification = "sos" | "bill_due";

export async function sendCriticalSMS(params: {
  phone: string;
  type: CriticalSMSNotification;
  message: string;
}) {
  const apiKey = process.env.MIMSMS_API_KEY;
  const senderId = process.env.MIMSMS_SENDER_ID;

  if (!apiKey || !senderId) {
    return {
      success: false,
      reason: "MIM SMS credentials are missing."
    };
  }

  return {
    success: true,
    preview: {
      phone: params.phone,
      type: params.type,
      senderId
    }
  };
}
