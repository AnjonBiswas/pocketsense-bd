import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <Card className="border-white/60 bg-white/85 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-900">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>রিপোর্ট</CardTitle>
            <CardDescription>View trends, comparisons, and progress across your money habits.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This screen is ready for charts, monthly summaries, and squad-based spending insights.
        </p>
      </CardContent>
    </Card>
  );
}
