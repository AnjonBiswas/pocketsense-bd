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
    language: "বাংলা",
    themeLight: "Light",
    themeDark: "Dark",
    login: "Login",
    signup: "Start free",
    badge: "Built for Bangladeshi students",
    title: "PocketSense",
    headline: "See your money clearly before it turns into guesswork.",
    intro:
"PocketSense: Smart finance dashboard for students. Tracks income, expenses, bills, and squad spending. Provides real-time budgets, alerts, and AI-driven financial guidance.",    primaryCta: "Create your budget profile",
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
    gainTitle: "Sharper decisions before money moves.",
    gains: [
      {
        title: "Know the safe number",
        text: "See a daily limit shaped by allowance, bills, savings goals, and the days still left in the month."
      },
      {
        title: "Spot leaks while they are small",
        text: "Catch meals, rides, subscriptions, printing, and tiny treats before they quietly bend the budget."
      },
      {
        title: "Stay ready for real student costs",
        text: "Keep hostel fees, mobile data, exam forms, books, and squad splits visible before they become a problem."
      }
    ],
    whyEyebrow: "Why this exists",
    whyTitle: "Student money is messy in the real world.",
    reasons: [
      "Money arrives from different places: parents, tuition, part-time work, scholarships, and one-off help.",
      "The problem is rarely one huge expense. It is the everyday choices that quietly pile up.",
      "PocketSense does not stop at tracking. It turns that noise into the next smart move."
    ],
    insideEyebrow: "Inside PocketSense",
    insideTitle: "Track, understand, and act from one calm place.",
    features: ["Expense tracking", "Budget alerts", "Squad splitting", "Reports"],
    featureDetails: [
      "Log each expense by category, note, and time so you can see where money actually goes.",
      "Get alerts when spending moves too fast, so you can react before the month gets tight.",
      "Split shared costs with friends and keep every group expense clear and fair.",
      "Turn your spending into simple reports that show trends, patterns, and savings gaps."
    ],
    finalLabel: "Free student start",
    finalTitle: "Create a profile, set your allowance, and get a smart daily limit in minutes.",
    blogText: "Read student money guides"
  },
  bn: {
    navSubtitle: "শিক্ষার্থীদের টাকা বোঝার স্মার্ট জায়গা",
    language: "English",
    themeLight: "লাইট",
    themeDark: "ডার্ক",
    login: "লগইন",
    signup: "ফ্রি শুরু",
    badge: "বাংলাদেশি শিক্ষার্থীদের জন্য বানানো",
    title: "পকেটসেন্স",
    headline: "টাকা অনুমান নয়, পরিষ্কার সিদ্ধান্তে দেখুন।",
    intro:
"PocketSense শিক্ষার্থীদের স্মার্ট ফিন্যান্স প্ল্যাটফর্ম। আয়-ব্যয়-বিল-গ্রুপ প্ল্যান এক জায়গায়। রিয়েল-টাইম বাজেট, স্মার্ট অ্যালার্ট এবং AI পরামর্শ দিয়ে সঠিক আর্থিক সিদ্ধান্তে সাহায্য করে।।"  ,  primaryCta: "Budget profile তৈরি করুন",
    secondaryCta: "Dashboard দেখুন",
    previewLabel: "লাইভ বাজেট সিগন্যাল",
    previewTitle: "আজ Tk 240-এর মধ্যে খরচ রাখুন",
    previewHint:
      "আগামী ৫ class day lunch Tk 160-এর মধ্যে রাখলে hostel fee আর একবার squad dinner-এর জায়গা থাকবে।",
    stats: [
      ["আজ safe spend", "Tk 240", "bill ও savings বাদ দিয়ে"],
      ["মাস বাকি", "37%", "আর ১১ দিন বাকি"],
      ["Risk ধরা গেছে", "Food", "খরচ দ্রুত বাড়ছে"]
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
    gainTitle: "প্রতিটি খরচের আগে আরও পরিষ্কার উত্তর।",
    gains: [
      {
        title: "আজ কতটা খরচ safe, বুঝবেন",
        text: "Allowance, bill, savings target আর বাকি দিনের ওপর ভিত্তি করে daily limit পাবেন।"
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
    whyTitle: "শিক্ষার্থীদের budget সাধারণত ছোট ছোট জায়গায় ভাঙে।",
    reasons: [
      "টাকা আসে ভিন্ন ভিন্ন জায়গা থেকে: parents, tuition, part-time work, scholarship বা emergency support।",
      "সমস্যা সাধারণত এক বড় খরচে না। ছোট ছোট daily choice চুপচাপ মাসের budget নষ্ট করে।",
      "PocketSense শুধু পুরনো খরচ record করে না। পরের smart move কী হওয়া উচিত সেটাও বুঝিয়ে দেয়।"
    ],
    insideEyebrow: "PocketSense-এর ভেতরে",
    insideTitle: "Track, understand, and act - সব এক জায়গায়।",
    features: ["Expense tracking", "Budget alerts", "Squad splitting", "Reports"],
    featureDetails: [
      "প্রতিটি খরচ category, note আর time সহ নথিভুক্ত করুন, যাতে টাকা কোথায় যাচ্ছে স্পষ্ট দেখা যায়।",
      "খরচ খুব দ্রুত বাড়তে থাকলে alert পাবেন, যাতে মাস শেষ হওয়ার আগেই ব্যবস্থা নিতে পারেন।",
      "বন্ধুদের সাথে shared cost ভাগ করে নিন, আর প্রতিটি group expense পরিষ্কার ও ন্যায্য রাখুন।",
      "আপনার খরচকে সহজ report-এ বদলে trend, pattern আর savings gap এক নজরে দেখুন।"
    ],
    finalLabel: "ফ্রি student start",
    finalTitle: "Profile তৈরি করুন, allowance সেট করুন, আর কয়েক মিনিটেই smart daily limit পান।",
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
const revealClass =
  "opacity-0 translate-y-6 blur-sm transition-all duration-700 ease-out will-change-transform data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 data-[visible=true]:blur-0";

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
  const bottomBarClass = isDark
    ? "rounded-[2rem] bg-slate-950 px-5 py-6 text-white shadow-xl shadow-slate-900/15 sm:px-6 lg:flex lg:items-center lg:justify-between"
    : "rounded-[2rem] border border-slate-200 bg-white px-5 py-6 text-slate-950 shadow-xl shadow-slate-900/10 sm:px-6 lg:flex lg:items-center lg:justify-between";
  const gainFooters = [
    "Built to protect today's spending",
    "Built to stop quiet budget drift",
    "Built for upcoming campus expenses"
  ];
  const featureAccents = [
    {
      baseLight: "radial-gradient(circle at top left, rgba(16, 185, 129, 0.03), transparent 46%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(236,253,245,0.92))",
      baseDark: "radial-gradient(circle at top left, rgba(16,185,129,0.18), transparent 42%), linear-gradient(135deg, rgba(15,23,42,0.90), rgba(2,6,23,0.80))",
      hoverLight: "radial-gradient(circle at top left, rgba(5,150,105,0.28), transparent 38%), linear-gradient(135deg, rgba(240,253,250,0.98) 0%, rgba(209,250,229,0.88) 54%, rgba(167,243,208,0.72) 100%)",
      hoverDark: "radial-gradient(circle at top left, rgba(16,185,129,0.32), transparent 34%), linear-gradient(135deg, rgba(6,95,70,0.72) 0%, rgba(2,6,23,0.90) 56%, rgba(15,23,42,0.78) 100%)"
    },
    {
      baseLight: "radial-gradient(circle at top left, rgba(14,165,233,0.14), transparent 46%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,249,255,0.92))",
      baseDark: "radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 42%), linear-gradient(135deg, rgba(15,23,42,0.90), rgba(2,6,23,0.80))",
      hoverLight: "radial-gradient(circle at top left, rgba(2,132,199,0.28), transparent 38%), linear-gradient(135deg, rgba(248,250,252,0.98) 0%, rgba(224,242,254,0.88) 54%, rgba(186,230,253,0.72) 100%)",
      hoverDark: "radial-gradient(circle at top left, rgba(14,165,233,0.32), transparent 34%), linear-gradient(135deg, rgba(7,89,133,0.72) 0%, rgba(2,6,23,0.90) 56%, rgba(15,23,42,0.78) 100%)"
    },
    {
      baseLight: "radial-gradient(circle at top left, rgba(139,92,246,0.14), transparent 46%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(245,243,255,0.92))",
      baseDark: "radial-gradient(circle at top left, rgba(139,92,246,0.18), transparent 42%), linear-gradient(135deg, rgba(15,23,42,0.90), rgba(2,6,23,0.80))",
      hoverLight: "radial-gradient(circle at top left, rgba(109,40,217,0.28), transparent 38%), linear-gradient(135deg, rgba(250,245,255,0.98) 0%, rgba(237,233,254,0.88) 54%, rgba(221,214,254,0.72) 100%)",
      hoverDark: "radial-gradient(circle at top left, rgba(139,92,246,0.32), transparent 34%), linear-gradient(135deg, rgba(91,33,182,0.72) 0%, rgba(2,6,23,0.90) 56%, rgba(15,23,42,0.78) 100%)"
    },
    {
      baseLight: "radial-gradient(circle at top left, rgba(245,158,11,0.14), transparent 46%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,251,235,0.92))",
      baseDark: "radial-gradient(circle at top left, rgba(245,158,11,0.18), transparent 42%), linear-gradient(135deg, rgba(15,23,42,0.90), rgba(2,6,23,0.80))",
      hoverLight: "radial-gradient(circle at top left, rgba(217,119,6,0.28), transparent 38%), linear-gradient(135deg, rgba(255,251,240,0.98) 0%, rgba(254,240,138,0.58) 54%, rgba(193, 169, 52, 0.3) 100%)",
      hoverDark: "radial-gradient(circle at top left, rgba(245,158,11,0.32), transparent 34%), linear-gradient(135deg, rgba(146,64,14,0.72) 0%, rgba(2,6,23,0.90) 56%, rgba(15,23,42,0.78) 100%)"
    }
  ];
  const statCards = text.stats.map(([label, value, note], index) => {
    const meta = [
      {
        icon: ShieldCheck,
        chip: "protected today",
        chipClass: isDark ? "bg-emerald-400/15 text-emerald-200" : "bg-emerald-100 text-emerald-700",
        orbClass: isDark ? "bg-emerald-300/15" : "bg-emerald-200/70",
        trackClass: isDark ? "bg-emerald-300/15" : "bg-emerald-100",
        fillClass: "bg-emerald-400",
        fillWidth: "72%"
      },
      {
        icon: TrendingDown,
        chip: "month momentum",
        chipClass: isDark ? "bg-sky-400/15 text-sky-200" : "bg-sky-100 text-sky-700",
        orbClass: isDark ? "bg-sky-300/15" : "bg-sky-200/70",
        trackClass: isDark ? "bg-sky-300/15" : "bg-sky-100",
        fillClass: "bg-sky-400",
        fillWidth: "37%"
      },
      {
        icon: BellRing,
        chip: "watching closely",
        chipClass: isDark ? "bg-amber-400/15 text-amber-200" : "bg-amber-100 text-amber-700",
        orbClass: isDark ? "bg-amber-300/15" : "bg-amber-200/70",
        trackClass: isDark ? "bg-amber-300/15" : "bg-amber-100",
        fillClass: "bg-amber-400",
        fillWidth: "64%"
      }
    ][index];

    return { label, value, note, ...meta };
  });
  const reasonLabels = [
    "Multiple income streams",
    "Small leaks add up",
    "Decisions, not just records"
  ];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!elements.length) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => {
        element.dataset.visible = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.dataset.visible = "true";
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-4 pb-8 sm:px-6 lg:px-8" lang={language}>
      <nav className={cn("sticky top-0 z-50 mx-auto mt-1 flex w-full max-w-7xl items-center justify-between gap-3 rounded-full px-3 py-2.5 backdrop-blur-2xl sm:px-4", navShellClass)}>
        <PocketSenseLogo
          href="/"
          size={44}
          subtitle={text.navSubtitle}
          className="min-w-0 pl-1"
          textClassName={isDark ? "[&_p:first-child]:text-white [&_p:last-child]:text-white/70" : "[&_p:first-child]:text-slate-950 [&_p:last-child]:text-slate-500"}
          priority
        />

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
        <div id="what" className="scroll-mt-28 grid gap-8 px-5 py-11 sm:scroll-mt-32 sm:px-8 lg:scroll-mt-36 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.78fr)] lg:px-5 lg:py-1 xl:px-12">
          <div className={cn("min-w-0 self-center", revealClass)} data-reveal>
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

          <div className={cn("relative min-h-[22rem] self-center sm:min-h-[26rem] lg:min-h-[31rem]", revealClass)} data-reveal>
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

        <div className={cn("grid grid-cols-3 gap-2 overflow-hidden border-t px-2 pb-1 pt-0 sm:grid sm:grid-cols-3 sm:gap-0 sm:px-0 sm:pb-0 sm:pt-0", isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white/70", revealClass)} data-reveal>
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={cn(
                  "group relative min-h-[6.75rem] overflow-hidden p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[10rem] sm:p-6",
                  isDark ? "border-white/10" : "border-slate-200"
                )}
              >
                <div className={cn("absolute inset-x-0 top-0 h-1", stat.fillClass)} aria-hidden="true" />
                <div className={cn("absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100", stat.orbClass, isDark ? "opacity-50" : "opacity-70")} aria-hidden="true" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn("text-[0.68rem] font-medium leading-none sm:text-sm", subduedClass)}>{stat.label}</p>
                      <p className={cn("mt-1 text-lg font-semibold tracking-tight sm:mt-2 sm:text-4xl", isDark ? "text-white" : "text-slate-950")}>{stat.value}</p>
                    </div>
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.9rem] transition-transform duration-300 group-hover:scale-110 sm:h-11 sm:w-11 sm:rounded-[1.1rem]", isDark ? "bg-slate-950/80 text-white" : "bg-white text-slate-950 shadow-sm")}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 sm:mt-4">
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.14em] sm:px-2.5 sm:py-1 sm:text-[0.7rem]", stat.chipClass)}>
                      {stat.chip}
                    </span>
                  </div>

                  <div className={cn("mt-2 h-1 overflow-hidden rounded-full sm:mt-4 sm:h-2", stat.trackClass)}>
                    <div className={cn("h-full rounded-full transition-all duration-700 group-hover:w-full", stat.fillClass)} style={{ width: stat.fillWidth }} aria-hidden="true" />
                  </div>

                  <p className={cn("mt-2 text-[0.62rem] leading-4 sm:mt-4 sm:text-sm sm:leading-6", subduedClass)}>{stat.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <section
          id="gain"
          data-reveal
          className={cn(
            "mt-6 scroll-mt-28 rounded-[2rem] border px-5 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:mt-8 sm:scroll-mt-32 sm:px-6 lg:mt-10 lg:scroll-mt-36 lg:px-8",
            isDark
              ? "border-white/10 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.96)_0%,rgba(10,14,28,0.98)_45%,rgba(4,6,16,1)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.28)]"
              : "border-slate-200 bg-gradient-to-b from-white/85 to-white/45",
            revealClass
          )}
        >
          <div className={cn("max-w-2xl", revealClass)} data-reveal>
            <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]", isDark ? "bg-white/10 text-emerald-100" : "bg-emerald-50 text-emerald-700")}>
              <Sparkles className="h-3.5 w-3.5" />
              {text.gainEyebrow}
            </div>
            <h2 className={cn("mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl", mutedHeadingClass)}>{text.gainTitle}</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {text.gains.map((item, index) => {
              const Icon = gainIcons[index];
              const accent = [
                "from-emerald-500/15 via-emerald-500/5 to-transparent",
                "from-sky-500/15 via-sky-500/5 to-transparent",
                "from-amber-500/15 via-amber-500/5 to-transparent"
              ][index];
              const badge = ["01", "02", "03"][index];

              return (
                <article
                  key={item.title}
                  className={cn(
                    "group relative overflow-hidden rounded-[1.8rem] border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5",
                    isDark ? "border-white/10 bg-white/[0.04] hover:border-white/20" : "border-slate-200 hover:border-slate-300 hover:shadow-slate-900/10"
                  )}
                  data-reveal
                  style={{ transitionDelay: `${index * 110}ms` }}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100", accent)} aria-hidden="true" />
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-current opacity-[0.04] blur-3xl transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-[1rem] sm:h-11 sm:w-11 sm:rounded-[1.1rem]", isDark ? "bg-slate-950 text-white" : "bg-slate-950 text-white")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] sm:px-2.5 sm:py-1 sm:text-[0.7rem]", isDark ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-500")}>
                        {badge}
                      </span>
                    </div>
                    <h3 className={cn("mt-3 text-lg font-semibold leading-tight sm:mt-4 sm:text-2xl", mutedHeadingClass)}>{item.title}</h3>
                    <p className={cn("mt-2 text-sm leading-6 sm:mt-2.5 sm:text-base", mutedClass)}>{item.text}</p>
                    <div className={cn("mt-auto pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] sm:pt-4 sm:text-xs sm:tracking-[0.2em]", isDark ? "text-white/45" : "text-slate-400")}>
                      {gainFooters[index]}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="why" className={cn("mt-6 scroll-mt-28 grid gap-6 rounded-[2rem] border border-slate-200 bg-white/55 px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-950/20 sm:mt-8 sm:scroll-mt-32 sm:px-6 lg:mt-10 lg:scroll-mt-36 lg:grid-cols-[0.86fr_1fr] lg:px-8", revealClass)} data-reveal>
          <div className={cn("lg:sticky lg:top-28 lg:self-start", revealClass)} data-reveal>
            <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]", isDark ? "bg-white/10 text-emerald-100" : "bg-emerald-50 text-emerald-700")}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {text.whyEyebrow}
            </div>
            <h2 className={cn("mt-3 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl", mutedHeadingClass)}>{text.whyTitle}</h2>
            <p className={cn("mt-3 max-w-xl text-sm leading-7 sm:text-base", mutedClass)}>
              PocketSense helps you make sense of that mess before it turns into stress.
            </p>
          </div>

          <div className="grid gap-3">
            {text.reasons.map((reason, index) => (
              <div
                key={reason}
                className={cn(
                  "group relative overflow-hidden rounded-[1.5rem] border p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5",
                  isDark ? "border-white/10 bg-white/[0.04] hover:border-white/20" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-slate-900/10"
                )}
                data-reveal
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={cn("absolute inset-y-0 left-0 w-1", ["bg-emerald-400", "bg-sky-400", "bg-amber-400"][index])} aria-hidden="true" />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    [
                      "from-emerald-400/15 via-emerald-300/8 to-transparent",
                      "from-sky-400/15 via-sky-300/8 to-transparent",
                      "from-amber-400/15 via-amber-300/8 to-transparent"
                    ][index]
                  )}
                  aria-hidden="true"
                />
                <div className="relative flex gap-4">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] text-sm font-semibold sm:h-10 sm:w-10", isDark ? "bg-slate-950 text-white" : "bg-slate-950 text-white")}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", isDark ? "text-white/55" : "text-slate-500")}>
                      {reasonLabels[index]}
                    </p>
                    <p className={cn("mt-1 text-sm leading-6 sm:text-base", mutedClass)}>{reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={cn("grid gap-5 border-t border-slate-200 py-10 dark:border-slate-700 lg:grid-cols-[1fr_0.8fr] lg:items-center", revealClass)} data-reveal>
          <div className={revealClass} data-reveal>
            <p className="text-sm font-semibold uppercase text-primary">{text.insideEyebrow}</p>
            <h2 className={cn("mt-2 text-3xl font-semibold leading-tight sm:text-4xl", mutedHeadingClass)}>{text.insideTitle}</h2>
          </div>

          <div className="grid items-start gap-3 sm:grid-cols-2">
            {text.features.map((feature, index) => {
              const Icon = featureIcons[index];
              const detail = text.featureDetails[index];

              return (
                <div
                key={feature}
                className={cn(
                    "group relative self-start overflow-hidden rounded-[1.5rem] border p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/15 focus-within:-translate-y-1 focus-within:shadow-2xl sm:min-h-[4.5rem] sm:p-4",
                    isDark ? "border-white/10 hover:border-white/25" : "border-slate-200 hover:border-slate-300 hover:shadow-slate-900/15"
                  )}
                  tabIndex={0}
                  data-reveal
                  style={{
                    backgroundImage: isDark ? featureAccents[index].baseDark : featureAccents[index].baseLight,
                    transitionDelay: `${index * 90}ms`
                  }}
                >
                <div
                    className="absolute inset-0 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:saturate-200 group-hover:scale-[1.01] group-focus-within:opacity-100 group-focus-within:saturate-200 group-focus-within:scale-[1.01]"
                    style={{
                      backgroundImage: isDark ? featureAccents[index].hoverDark : featureAccents[index].hoverLight,
                      backgroundPosition: "center",
                      backgroundSize: "100% 100%",
                      transform: "none"
                    }}
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] border transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-focus-within:scale-110 group-focus-within:shadow-lg", isDark ? "border-white/10 bg-slate-950 text-white" : "border-white/70 bg-white text-slate-950 shadow-sm")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={cn("block text-sm font-semibold leading-snug transition-colors duration-300 sm:text-base", mutedHeadingClass)}>
                        {feature}
                      </span>
                      <p
                        className={cn(
                          "mt-1 max-h-0 overflow-hidden text-sm leading-6 opacity-0 transition-all duration-300 group-hover:max-h-24 group-hover:opacity-100 group-hover:pt-1 group-focus-within:max-h-24 group-focus-within:opacity-100 group-focus-within:pt-1",
                          mutedClass
                        )}
                      >
                        {detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={cn(bottomBarClass, revealClass)} data-reveal>
          <div className={cn("max-w-2xl", revealClass)} data-reveal>
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
