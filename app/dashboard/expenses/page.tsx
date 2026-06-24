import { WalletCards } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpensesPage() {
  return (
    <Card className="border-white/60 bg-white/85 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-900">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>খরচ ট্র্যাকার</CardTitle>
            <CardDescription>Add daily expenses and review category patterns.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This section is ready for your expense entry form, category cards, and spending history.
        </p>
      </CardContent>
    </Card>
  );
}
