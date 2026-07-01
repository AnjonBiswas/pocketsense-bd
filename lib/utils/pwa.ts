"use client";

export type PendingAction = {
  id: string;
  type: "add-expense";
  payload: Record<string, unknown>;
  createdAt: string;
};

const DB_NAME = "pocketsense-pwa";
const STORE_NAME = "pending-actions";

declare global {
  interface WindowEventMap {
    beforeinstallprompt: Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    };
  }
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, handler: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = handler(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function isRunningAsPWA() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  if (process.env.NODE_ENV !== "production") {
    const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
    await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));

    if ("caches" in window) {
      const cacheKeys = await window.caches.keys().catch(() => []);
      await Promise.all(
        cacheKeys
          .filter((key) => key.startsWith("pocketsense-"))
          .map((key) => window.caches.delete(key).catch(() => false))
      );
    }

    return null;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  return registration;
}

export async function queuePendingAction(action: PendingAction) {
  await withStore("readwrite", (store) => store.put(action));
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    await registration?.sync.register("pocketsense-sync-pending-actions").catch(() => null);
  }
}

export async function getPendingActions() {
  return withStore<PendingAction[]>("readonly", (store) => store.getAll());
}

export async function removePendingAction(id: string) {
  await withStore("readwrite", (store) => store.delete(id));
}

export async function flushPendingActions() {
  const pendingActions = await getPendingActions();

  for (const action of pendingActions) {
    if (action.type === "add-expense") {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.payload)
      }).catch(() => null);

      if (response?.ok) {
        await removePendingAction(action.id);
      }
    }
  }
}
