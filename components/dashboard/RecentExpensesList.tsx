import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCategoryMeta } from "@/lib/utils/categories";

export type RecentExpenseItem = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
};

type RecentExpensesListProps = {
  expenses: RecentExpenseItem[];
};

export function RecentExpensesList({ expenses }: RecentExpensesListProps) {
  return (
    <Card className="border-white/60 bg-white/90 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg">Recent expenses</CardTitle>
          <CardDescription>সর্বশেষ ৫টি লেনদেন</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-full">
          See All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.map((expense) => {
          const meta = getCategoryMeta(expense.category);

          return (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                  style={{ backgroundColor: `${meta.color}22` }}
                >
                  {meta.icon}
                </div>
                <div>
                  <p className="font-medium">{expense.note || meta.bn}</p>
                  <p className="text-xs text-muted-foreground">
                    {meta.bn} · {formatDistanceToNow(new Date(expense.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-rose-600">-৳{expense.amount.toFixed(0)}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
