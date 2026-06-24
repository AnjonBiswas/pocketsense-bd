export const translations = {
  bn: {
    common: {
      appName: "PocketSense BD",
      welcome: "ফিরে আসায় স্বাগতম",
      loading: "লোড হচ্ছে...",
      logout: "লগআউট",
      profile: "প্রোফাইল",
      settings: "সেটিংস",
      language: "ভাষা",
      bangla: "বাংলা",
      english: "English"
    },
    nav: {
      home: "হোম",
      expenses: "খরচ",
      income: "আয়",
      reports: "রিপোর্ট"
    },
    dashboard: {
      overview: "ড্যাশবোর্ড ওভারভিউ",
      today: "আজকের অবস্থা",
      streak: "স্ট্রিক",
      days: "দিন",
      quickStats: "দ্রুত পরিসংখ্যান",
      budgetLeft: "এই মাসে বাকি",
      weeklySpend: "এই সপ্তাহের খরচ",
      savingsGoal: "সেভিংস গোল",
      dailyTip: "আজকের টিপ",
      dailyTipText: "ক্যান্টিনে একবার কম খেলে মাস শেষে বেশ কিছু টাকা বাঁচে।",
      campusPulse: "ক্যাম্পাস পালস",
      campusPulseText: "এই সপ্তাহে চা, যাতায়াত আর মোবাইল রিচার্জ সবচেয়ে বেশি খরচের জায়গা।",
      streakText: "টানা ৫ দিন খরচ লিখেছেন",
      quickBudget: "মাসিক বাজেট",
      quickSavings: "জরুরি সঞ্চয়",
      quickEntries: "আজকের এন্ট্রি",
      reportsTitle: "টাকার গল্প বোঝা এখন সহজ",
      reportsText: "দিন, সপ্তাহ আর মাস ধরে কোথায় টাকা যাচ্ছে তা এক জায়গায় দেখুন।"
    }
  },
  en: {
    common: {
      appName: "PocketSense BD",
      welcome: "Welcome back",
      loading: "Loading...",
      logout: "Logout",
      profile: "Profile",
      settings: "Settings",
      language: "Language",
      bangla: "বাংলা",
      english: "English"
    },
    nav: {
      home: "Home",
      expenses: "Expenses",
      income: "Income",
      reports: "Reports"
    },
    dashboard: {
      overview: "Dashboard Overview",
      today: "Today at a glance",
      streak: "Streak",
      days: "days",
      quickStats: "Quick stats",
      budgetLeft: "Left this month",
      weeklySpend: "Spent this week",
      savingsGoal: "Savings goal",
      dailyTip: "Daily tip",
      dailyTipText: "Skipping one extra canteen snack each day adds up surprisingly fast.",
      campusPulse: "Campus pulse",
      campusPulseText: "Tea, transport, and mobile recharge are driving most student spending this week.",
      streakText: "You have logged expenses for 5 days in a row",
      quickBudget: "Monthly budget",
      quickSavings: "Emergency reserve",
      quickEntries: "Entries today",
      reportsTitle: "Understand your money story faster",
      reportsText: "See where your cash moves across days, weeks, and months in one place."
    }
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationTree = (typeof translations)[Language];
