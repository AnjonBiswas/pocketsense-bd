export type ChallengeDefinition = {
  id: string;
  name: {
    bn: string;
    en: string;
  };
  description: {
    bn: string;
    en: string;
  };
  target: number;
  category: string;
  xp: number;
  badge: string;
  duration: number;
};

export const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "canteen_fast",
    name: { bn: "ক্যান্টিন ফাস্ট", en: "Canteen Fast" },
    description: {
      bn: "৫ দিন ক্যান্টিনে খাবার না কিনুন",
      en: "Don't buy canteen food for 5 days"
    },
    target: 5,
    category: "food",
    xp: 500,
    badge: "canteen-master",
    duration: 7
  },
  {
    id: "walking_warrior",
    name: { bn: "হাঁটার যোদ্ধা", en: "Walking Warrior" },
    description: {
      bn: "রিকশার বদলে ১০ বার হাঁটুন",
      en: "Walk instead of rickshaw 10 times"
    },
    target: 10,
    category: "transport",
    xp: 700,
    badge: "green-commuter",
    duration: 14
  },
  {
    id: "cigarette_crusher",
    name: { bn: "সিগারেট ক্রাশার", en: "Cigarette Crusher" },
    description: {
      bn: "৭ দিন সিগারেট না কিনে কাটান",
      en: "Avoid buying cigarettes for 7 days"
    },
    target: 7,
    category: "cigarettes",
    xp: 850,
    badge: "smoke-free",
    duration: 10
  },
  {
    id: "budget_king",
    name: { bn: "বাজেট কিং", en: "Budget King" },
    description: {
      bn: "টানা ৭ দিন দৈনিক বাজেটের মধ্যে থাকুন",
      en: "Stay under your daily budget for 7 days"
    },
    target: 7,
    category: "budget",
    xp: 900,
    badge: "budget-king",
    duration: 7
  },
  {
    id: "treat_smart",
    name: { bn: "ট্রিট স্মার্ট", en: "Treat Smart" },
    description: {
      bn: "৩ বার Treat Calculator ব্যবহার করে সাশ্রয়ী বিকল্প বেছে নিন",
      en: "Use Treat Calculator 3 times and choose cheaper alternatives"
    },
    target: 3,
    category: "entertainment",
    xp: 450,
    badge: "smart-sipper",
    duration: 14
  }
] as const;

