"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CheckCircle2,
  Globe,
  LogIn,
  Moon,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingDown,
  Users,
  WalletCards
} from "lucide-react";
import { PocketSenseLogo } from "@/components/brand/PocketSenseLogo";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const copy = {
  en: {
    navSubtitle: "Student money clarity",
    navItems: ["What is it", "What you gain", "Why this"],
    language: "বাংলা",
    themeLight: "Light",
    themeDark: "Dark",
    login: "Login",
    signup: "Start free",
    badge: "Built for Bangladeshi students",
    title: "PocketSense",
    headline: "Understand your money before the month gets confusing.",
    intro:
      "PocketSense is a student finance dashboard that turns allowance, tuition income, daily spending, upcoming bills, and shared plans into clear decisions.",
    primaryCta: "Create your budget profile",
    secondaryCta: "See dashboard",
    previewLabel: "Live budget signal",
    previewTitle: "Spend under Tk 240 today",
    previewHint:
      "If lunch stays under Tk 160 for the next 5 class days, you still keep room for hostel fee and one squad dinner.",
    stats: [
      ["Safe today", "Tk 240", "after bills and savings"],
      ["Month left", "37%", "with 11 days remaining"],
      ["Risk spotted", "Food", "spending is climbing"]
    ],
    snapshot: [
      ["Allowance", "Tk 18,000"],
      ["Spent", "Tk 11,280"],
      ["Reserve", "Tk 3,000"]
    ],
    rows: [
      ["Food", "Tk 4,120", "Tk 5,700", "72%"],
      ["Transport", "Tk 1,860", "Tk 3,900", "48%"],
      ["Study", "Tk 2,240", "Tk 2,750", "81%"]
    ],
    gainEyebrow: "What you gain",
    gainTitle: "A useful answer before every spend.",
    gains: [
      {
        title: "Know what is safe today",
        text: "Get a daily limit based on your allowance, bills, savings target, and remaining days."
      },
      {
        title: "Catch money leaks early",
        text: "See when meals, rides, subscriptions, printing, or treats are quietly crossing the line."
      },
      {
        title: "Stay ready for real student costs",
        text: "Hostel fees, mobile data, exam forms, books, and squad splits stay visible before they hurt."
      }
    ],
    whyEyebrow: "Why this exists",
    whyTitle: "Student budgets break differently.",
    reasons: [
      "Money comes from different places: parents, tuition, part-time work, scholarships, and emergency support.",
      "The problem is rarely one big expense. It is usually small daily choices that add up silently.",
      "PocketSense does not only record what happened. It explains what your next smart move should be."
    ],
    insideEyebrow: "Inside PocketSense",
    insideTitle: "Track, understand, and act from one place.",
    features: ["Expense tracking", "Budget alerts", "Squad splitting", "Reports"],
    finalLabel: "Free student start",
    finalTitle: "Create a profile, set your allowance, and get a useful daily limit in minutes.",
    blogText: "Read student money guides"
  },
  bn: {
    navSubtitle: "শিক্ষার্থীদের টাকা বোঝার সহজ জায়গা",
    navItems: ["এটা কী", "আপনি কী পাবেন", "কেন দরকার"],
    language: "English",
    themeLight: "লাইট",
    themeDark: "ডার্ক",
    login: "লগইন",
    signup: "ফ্রি শুরু",
    badge: "বাংলাদেশের শিক্ষার্থীদের জন্য তৈরি",
    title: "পকেটসেন্স",
    headline: "মাস জটিল হওয়ার আগেই নিজের টাকার অবস্থা বুঝুন।",
    intro:
      "PocketSense হলো শিক্ষার্থীদের জন্য personal finance dashboard। allowance, tuition income, daily খরচ, upcoming bill আর friends/squad plan একসাথে বুঝে সহজ decision দেয়।",
    primaryCta: "Budget profile তৈরি করুন",
    secondaryCta: "Dashboard দেখুন",
    previewLabel: "লাইভ বাজেট সিগন্যাল",
    previewTitle: "আজ Tk 240-এর মধ্যে খরচ রাখুন",
    previewHint:
      "পরের ৫ class day lunch Tk 160-এর মধ্যে রাখলে hostel fee আর একবার squad dinner-এর জায়গা থাকবে।",
    stats: [
      ["আজ safe spend", "Tk 240", "bill ও savings বাদ দিয়ে"],
      ["মাস বাকি", "37%", "আর ১১ দিন বাকি"],
      ["Risk দেখা গেছে", "Food", "খরচ দ্রুত বাড়ছে"]
    ],
    snapshot: [
      ["Allowance", "Tk 18,000"],
      ["খরচ হয়েছে", "Tk 11,280"],
      ["Reserve", "Tk 3,000"]
    ],
    rows: [
      ["Food", "Tk 4,120", "Tk 5,700", "72%"],
      ["Transport", "Tk 1,860", "Tk 3,900", "48%"],
      ["Study", "Tk 2,240", "Tk 2,750", "81%"]
    ],
    gainEyebrow: "আপনি কী পাবেন",
    gainTitle: "প্রতিটি খরচের আগে পরিষ্কার উত্তর।",
    gains: [
      {
        title: "আজ কত খরচ safe বুঝবেন",
        text: "Allowance, bill, savings target আর বাকি দিনের উপর ভিত্তি করে daily limit পাবেন।"
      },
      {
        title: "কোথায় টাকা leak হচ্ছে ধরতে পারবেন",
        text: "Meal, ride, subscription, print বা treat budget ছাড়িয়ে যাচ্ছে কিনা আগেই দেখা যাবে।"
      },
      {
        title: "Student cost-এর জন্য ready থাকবেন",
        text: "Hostel fee, mobile data, exam form, book আর squad split চোখের সামনে থাকবে।"
      }
    ],
    whyEyebrow: "কেন এটা দরকার",
    whyTitle: "শিক্ষার্থীদের budget ভাঙে আলাদা ভাবে।",
    reasons: [
      "টাকা আসে ভিন্ন ভিন্ন জায়গা থেকে: parents, tuition, part-time work, scholarship বা emergency support।",
      "সমস্যা সাধারণত এক বড় খরচ না। ছোট ছোট daily choice চুপচাপ month-এর budget নষ্ট করে।",
      "PocketSense শুধু পুরনো খরচ record করে না। পরের smart move কী হওয়া উচিত সেটাও বুঝায়।"
    ],
    insideEyebrow: "PocketSense-এর ভেতরে",
    insideTitle: "Track, understand, and act - সব এক জায়গায়।",
    features: ["Expense tracking", "Budget alerts", "Squad splitting", "Reports"],
    finalLabel: "ফ্রি student start",
    finalTitle: "Profile তৈরি করুন, allowance সেট করুন, আর কয়েক মিনিটেই useful daily limit পান।",
    blogText: "Student money guide পড়ুন"
  }
} as const;

const gainIcons = [WalletCards, TrendingDown, ShieldCheck] as const;
const featureIcons = [ReceiptText, BellRing, Users, BarChart3] as const;
const showcaseImages = [
  { src: "/img1.svg", alt: "PocketSense dashboard overview" },
  { src: "/img2.svg", alt: "PocketSense budget planning screen" },
  { src: "/img3.svg", alt: "PocketSense spending insight screen" },
  { src: "/img4.svg", alt: "PocketSense student finance report screen" }
] as const;

export function LandingDashboard() {
  const { language, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const text = copy[language];
  const shellClass = isDark
    ? "bg-[linear-gradient(135deg,#050505_0%,#111827_38%,#0f766e_100%)] text-white shadow-[0_40px_100px_rgba(15,23,42,0.22)]"
    : "bg-[linear-gradient(135deg,#f7fbff_0%,#eef9f5_50%,#fff8ed_100%)] text-slate-950 shadow-[0_40px_100px_rgba(15,23,42,0.10)]";
  const navShellClass = isDark
    ? "border border-white/15 bg-slate-950/[0.94] text-white shadow-[0_24px_80px_rgba(2,6,23,0.35)] dark:border-white/10 dark:bg-slate-950/[0.9]"
    : "border border-slate-200 bg-white/88 text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.12)]";
  const mutedClass = isDark ? "text-white/68" : "text-slate-700";
  const subduedClass = isDark ? "text-white/55" : "text-slate-500";
  const mutedHeadingClass = isDark ? "text-white" : "text-slate-950";
  const sectionCardClass = isDark
    ? "group rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    : "group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10";
  const bottomBarClass = isDark
    ? "rounded-[2rem] bg-slate-950 px-5 py-6 text-white shadow-xl shadow-slate-900/15 sm:px-6 lg:flex lg:items-center lg:justify-between"
    : "rounded-[2rem] border border-slate-200 bg-white px-5 py-6 text-slate-950 shadow-xl shadow-slate-900/10 sm:px-6 lg:flex lg:items-center lg:justify-between";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <section className="px-4 pb-8 sm:px-6 lg:px-8" lang={language}>
      <nav className={cn("sticky top-0 z-50 mx-auto mt-3 flex w-full max-w-7xl items-center justify-between gap-3 rounded-full px-3 py-2.5 backdrop-blur-2xl sm:px-4", navShellClass)}>
        <PocketSenseLogo
          href="/"
          size={44}
          subtitle={text.navSubtitle}
          className="min-w-0 pl-1"
          textClassName={isDark ? "[&_p:first-child]:text-white [&_p:last-child]:text-white/70" : "[&_p:first-child]:text-slate-950 [&_p:last-child]:text-slate-500"}
          priority
        />

        <div className={cn("hidden items-center gap-1 rounded-full p-1.5 lg:flex", isDark ? "border border-white/10 bg-white/[0.08]" : "border border-slate-200 bg-slate-50")}>
          {text.navItems.map((item, index) => (
            <a
              key={item}
              href={["#what", "#gain", "#why"][index]}
              className={cn("rounded-full px-3.5 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5", isDark ? "text-white/85 hover:bg-white/12 hover:text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950")}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "tap-safe inline-flex h-11 items-center rounded-full border px-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5",
              "border-white/60 bg-white text-slate-900 hover:bg-secondary/70",
              "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800"
            )}
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">{text.themeLight}</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">{text.themeDark}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
            className={cn(
              "tap-safe inline-flex h-11 items-center rounded-full border px-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5",
              "border-white/60 bg-white text-slate-900 hover:bg-secondary/70",
              "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Globe className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{text.language}</span>
          </button>

          <Button asChild variant="outline" size="sm" className={cn("hidden h-10 rounded-full transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex", isDark ? "border-white/15 bg-white/[0.08] text-white hover:bg-white/15 hover:text-white" : "border-slate-200 bg-white text-slate-950 hover:bg-slate-50 hover:text-slate-950")}>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              {text.login}
            </Link>
          </Button>
          <Button asChild size="sm" className={cn("h-10 rounded-full transition-all duration-300 hover:-translate-y-0.5", isDark ? "bg-white text-slate-950 hover:bg-white/95" : "bg-slate-950 text-white hover:bg-slate-800")}>
            <Link href="/auth/signup">
              {text.signup}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>

      <div className={cn("mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem]", shellClass)}>
        <div id="what" className="grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.78fr)] lg:px-10 lg:py-12 xl:px-12">
          <div className="min-w-0 self-center">
            <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium", isDark ? "border border-white/10 bg-white/10 text-emerald-100" : "border border-emerald-200 bg-emerald-50 text-emerald-700")}>
              <Sparkles className="h-4 w-4" />
              {text.badge}
            </div>

            <h1 className={cn("mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl", isDark ? "text-white" : "text-slate-950")}>
              {text.title}
            </h1>
            <p className={cn("mt-4 max-w-3xl text-2xl font-medium leading-tight sm:text-3xl", isDark ? "text-white" : "text-slate-900")}>
              {text.headline}
            </p>
            <p className={cn("mt-5 max-w-2xl text-base leading-8 sm:text-lg", mutedClass)}>{text.intro}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className={cn("h-11 rounded-full px-5 transition-all duration-300 hover:-translate-y-0.5", isDark ? "bg-white text-slate-950 hover:bg-white/90" : "bg-slate-950 text-white hover:bg-slate-800")}>
                <Link href="/auth/signup">
                  {text.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className={cn("h-11 rounded-full px-5 transition-all duration-300 hover:-translate-y-0.5", isDark ? "border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white" : "border-slate-200 bg-white text-slate-950 hover:bg-slate-50 hover:text-slate-950")}>
                <Link href="/auth/login">{text.secondaryCta}</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[22rem] self-center sm:min-h-[26rem] lg:min-h-[31rem]">
            <div className="relative mx-auto aspect-square w-full max-w-[34rem] overflow-visible">
              {showcaseImages.map((image, index) => (
                <div
                  key={image.src}
                  className="landing-showcase-slide absolute inset-0 flex items-center justify-center"
                  style={{ animationDelay: `${index * 3.325}s` }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1500}
                    height={1500}
                    priority={index === 0}
                    className="h-full w-full object-contain drop-shadow-[0_28px_44px_rgba(15,23,42,0.14)]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={cn("grid border-t sm:grid-cols-3", isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white/60")}>
          {text.stats.map(([label, value, note]) => (
            <div key={label} className={cn("p-5 sm:border-r last:border-r-0", isDark ? "border-white/10" : "border-slate-200")}>
              <p className={cn("text-sm", subduedClass)}>{label}</p>
              <p className={cn("mt-2 text-3xl font-semibold", isDark ? "text-white" : "text-slate-950")}>{value}</p>
              <p className={cn("mt-2 text-sm", subduedClass)}>{note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <section id="gain" className="py-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-primary">{text.gainEyebrow}</p>
            <h2 className={cn("mt-2 text-3xl font-semibold leading-tight sm:text-4xl", mutedHeadingClass)}>{text.gainTitle}</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {text.gains.map((item, index) => {
              const Icon = gainIcons[index];

              return (
                <article key={item.title} className={sectionCardClass}>
                  <div className={cn("mb-5 flex h-11 w-11 items-center justify-center rounded-[1.1rem]", isDark ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-950 text-white")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={cn("text-xl font-semibold", mutedHeadingClass)}>{item.title}</h3>
                  <p className={cn("mt-3 text-sm leading-7", mutedClass)}>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="why" className="grid gap-6 border-t border-slate-200 py-10 dark:border-slate-700 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">{text.whyEyebrow}</p>
            <h2 className={cn("mt-2 text-3xl font-semibold leading-tight sm:text-4xl", mutedHeadingClass)}>{text.whyTitle}</h2>
          </div>

          <div className="grid gap-3">
            {text.reasons.map((reason, index) => (
                <div key={reason} className="flex gap-3 rounded-[1.5rem] border bg-card p-4 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.95rem] bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <p className={cn("text-sm leading-7", mutedClass)}>{reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 border-t border-slate-200 py-10 dark:border-slate-700 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">{text.insideEyebrow}</p>
            <h2 className={cn("mt-2 text-3xl font-semibold leading-tight sm:text-4xl", mutedHeadingClass)}>{text.insideTitle}</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {text.features.map((feature, index) => {
              const Icon = featureIcons[index];

              return (
                <div key={feature} className="flex items-center gap-3 rounded-[1.5rem] border bg-card p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-secondary text-secondary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">{feature}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className={bottomBarClass}>
          <div className="max-w-2xl">
            <div className={cn("mb-3 flex items-center gap-2", isDark ? "text-emerald-200" : "text-emerald-700")}>
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">{text.finalLabel}</span>
            </div>
            <h2 className={cn("text-2xl font-semibold leading-tight", mutedHeadingClass)}>{text.finalTitle}</h2>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 lg:mt-0">
            <Button asChild className={cn("h-11 rounded-full px-5 transition-all duration-300 hover:-translate-y-0.5", isDark ? "bg-white text-slate-950 hover:bg-white/90" : "bg-slate-950 text-white hover:bg-slate-800")}>
              <Link href="/auth/signup">{text.signup}</Link>
            </Button>
            <Button asChild variant="outline" className={cn("h-11 rounded-full px-5 transition-all duration-300 hover:-translate-y-0.5", isDark ? "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" : "border-slate-200 bg-white text-slate-950 hover:bg-slate-50 hover:text-slate-950")}>
              <Link href="/auth/login">{text.login}</Link>
            </Button>
            <Button asChild variant="ghost" className={cn("h-11 rounded-full px-5", isDark ? "text-white hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950")}>
              <Link href="/blog">{text.blogText}</Link>
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
