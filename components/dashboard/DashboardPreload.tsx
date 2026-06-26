export function DashboardPreload() {
  return (
    <>
      <link rel="preload" href="/api/dashboard/stats" as="fetch" crossOrigin="anonymous" />
      <link rel="prefetch" href="/api/expenses/recent" />
      <link rel="prefetch" href="/api/challenges" />
    </>
  );
}
