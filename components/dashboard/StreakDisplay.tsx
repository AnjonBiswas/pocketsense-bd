import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StreakDisplayProps = {
  streak: number;
  monthlyRank: string;
};

export function StreakDisplay({ streak, monthlyRank }: StreakDisplayProps) {
  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Consistency power</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-4"
          style={{ color: "#7c2d12" }}
        >
          <div className="text-3xl">🔥</div>
          <div>
            <p className="text-2xl font-bold" style={{ color: "#7c2d12" }}>
              {streak} দিন streak
            </p>
            <p className="text-sm" style={{ color: "#9a3412" }}>
              চালিয়ে যাও, momentum আছে
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Monthly rank: {monthlyRank}
        </div>
      </CardContent>
    </Card>
  );
}
