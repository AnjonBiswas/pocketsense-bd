import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardCardSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-full bg-secondary" />
        <div className="h-8 w-48 animate-pulse rounded-2xl bg-secondary" />
      </CardHeader>
      <CardContent>
        <div className={`w-full animate-pulse rounded-2xl bg-secondary ${tall ? "h-40" : "h-24"}`} />
      </CardContent>
    </Card>
  );
}
