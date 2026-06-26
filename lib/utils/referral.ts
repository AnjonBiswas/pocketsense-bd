export function generateReferralCode(userId: string, name?: string | null) {
  void name;
  const compactId = userId.replace(/-/g, "").toUpperCase();
  return `PS${compactId.slice(0, 10) || "FRIEND"}`;
}
