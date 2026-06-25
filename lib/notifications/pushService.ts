export async function requestPushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") {
    return "granted" as const;
  }

  const permission = await Notification.requestPermission();
  return permission;
}

export async function registerPushSubscription() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) {
    return null;
  }

  return registration;
}
