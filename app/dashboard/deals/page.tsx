import dynamic from "next/dynamic";
import { ThemeIllustration } from "@/components/features/ThemeIllustration";

const CampusDealsMap = dynamic(
  () => import("@/components/features/CampusDealsMap").then((module) => module.CampusDealsMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-sm">
        <div className="h-[420px] animate-pulse rounded-[28px] bg-slate-100 dark:bg-slate-800" />
      </div>
    )
  }
);

export default function DealsPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Deals map</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">Cheap eats and student discounts near campus</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Explore crowd-sourced budget food spots and student-friendly offers around Dhaka universities. This is built for the real student question: where can I hang out without breaking my month?
          </p>
        </div>
        <div className="rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-sm">
          <ThemeIllustration
            lightSrc="/illustrations/deals-light.svg"
            darkSrc="/illustrations/deals-dark.svg"
            alt="Campus deals illustration"
            className="mx-auto h-48 w-full object-contain"
          />
        </div>
      </div>

      <CampusDealsMap />
    </section>
  );
}
