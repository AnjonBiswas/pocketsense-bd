export type SurvivalTip = {
  id: string;
  title: {
    bn: string;
    en: string;
  };
  description: {
    bn: string;
    en: string;
  };
  savings: number;
  difficulty: "easy" | "medium" | "hard";
};

export const SURVIVAL_TIPS: SurvivalTip[] = [
  {
    id: "cook_home",
    title: { bn: "বাসায় রান্না করুন", en: "Cook at home" },
    description: { bn: "ম্যাগি বা ডিম খেলে দিনে ৳100 পর্যন্ত বাঁচবে", en: "Maggi or eggs can save up to ৳100/day" },
    savings: 100,
    difficulty: "easy"
  },
  {
    id: "walk",
    title: { bn: "হেঁটে যান", en: "Walk" },
    description: { bn: "রিকশা এড়িয়ে দিনে ৳60 বাঁচান", en: "Skip rickshaw rides and save ৳60/day" },
    savings: 60,
    difficulty: "easy"
  },
  {
    id: "no_cafe",
    title: { bn: "ক্যাফে বন্ধ", en: "No cafe visits" },
    description: { bn: "বাসায় কফি বানিয়ে দিনে ৳80 বাঁচান", en: "Make coffee at home and save ৳80/day" },
    savings: 80,
    difficulty: "medium"
  },
  {
    id: "pack_lunch",
    title: { bn: "লাঞ্চ সাথে নিন", en: "Pack lunch" },
    description: { bn: "বাইরে না খেয়ে দিনে ৳120 বাঁচান", en: "Bring lunch from home to save ৳120/day" },
    savings: 120,
    difficulty: "medium"
  },
  {
    id: "skip_cigarettes",
    title: { bn: "সিগারেট বাদ দিন", en: "Skip cigarettes" },
    description: { bn: "প্রতিদিন অন্তত ৳150 বাঁচতে পারে", en: "Cutting cigarettes can save ৳150/day" },
    savings: 150,
    difficulty: "hard"
  },
  {
    id: "borrow_books",
    title: { bn: "বই ধার করুন", en: "Borrow books" },
    description: { bn: "ফটোকপি বা লাইব্রেরি থেকে নিয়ে ৳50 বাঁচান", en: "Borrow or photocopy and save ৳50/day" },
    savings: 50,
    difficulty: "easy"
  },
  {
    id: "mobile_pause",
    title: { bn: "ডাটা খরচ কমান", en: "Reduce mobile data" },
    description: { bn: "ওয়াই-ফাই ব্যবহার করে দিনে ৳40 বাঁচান", en: "Use Wi-Fi more often and save ৳40/day" },
    savings: 40,
    difficulty: "easy"
  }
];
