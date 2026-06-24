import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">PocketSense BD</h1>
        <p className="text-muted-foreground">Open the dashboard shell to review the new UI.</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
