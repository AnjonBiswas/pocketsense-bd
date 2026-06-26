export async function jsonFetcher<T>(input: string): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store"
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  return payload as T;
}
