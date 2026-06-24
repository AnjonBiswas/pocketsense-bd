import { CircleDollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IncomePage() {
  return (
    <Card className="border-white/60 bg-white/85 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-900">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>আয়ের খাতা</CardTitle>
            <CardDescription>Track allowance, freelance work, and other income sources.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This route is ready for income forms, recurring income cards, and monthly totals.
        </p>
      </CardContent>
    </Card>
  );
}
