export type TreatAlternativeSeed = {
  category: "food" | "cafe" | "entertainment";
  original: string;
  alternative: string;
  savings: number;
  locations: string[];
};

export const TREAT_ALTERNATIVES: TreatAlternativeSeed[] = [
  {
    category: "food",
    original: "Domino's Pizza",
    alternative: "Local pizza shop",
    savings: 400,
    locations: ["Dhaka University area", "Dhanmondi", "Mirpur"]
  },
  {
    category: "food",
    original: "Premium burger combo",
    alternative: "Campus cafe burger",
    savings: 250,
    locations: ["BUET area", "NSU Gate 2", "BRACU"]
  },
  {
    category: "cafe",
    original: "Coffee chain latte",
    alternative: "Tong tea + bun",
    savings: 180,
    locations: ["Dhaka University area", "Farmgate", "Mohakhali"]
  },
  {
    category: "cafe",
    original: "Dessert cafe meetup",
    alternative: "Campus canteen hangout",
    savings: 220,
    locations: ["IUB", "BRACU", "NSU"]
  },
  {
    category: "entertainment",
    original: "Cinema ticket + snacks",
    alternative: "Shared streaming night",
    savings: 350,
    locations: ["Hall common room", "Bashundhara", "Uttara"]
  },
  {
    category: "entertainment",
    original: "Gaming zone session",
    alternative: "Board game cafe split",
    savings: 200,
    locations: ["Dhanmondi", "Banani"]
  }
] as const;

