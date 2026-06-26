export type UniversitySpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type CampusDeal = {
  id: string;
  universityId: string;
  title: string;
  type: "cheap_food" | "discount" | "hangout";
  latitude: number;
  longitude: number;
  priceHint: string;
  description: string;
};

export const UNIVERSITY_SPOTS: UniversitySpot[] = [
  { id: "du", name: "University of Dhaka", latitude: 23.7287, longitude: 90.3982 },
  { id: "buet", name: "BUET", latitude: 23.7268, longitude: 90.3938 },
  { id: "nsu", name: "North South University", latitude: 23.8162, longitude: 90.4254 },
  { id: "brac", name: "BRAC University", latitude: 23.7802, longitude: 90.407 },
  { id: "iub", name: "Independent University Bangladesh", latitude: 23.8271, longitude: 90.4256 }
];

export const CAMPUS_DEALS: CampusDeal[] = [
  {
    id: "du-canteen-tea",
    universityId: "du",
    title: "DU Arts Canteen Tea Stall",
    type: "cheap_food",
    latitude: 23.7289,
    longitude: 90.3993,
    priceHint: "Tea ৳10, snacks ৳25",
    description: "Reliable low-cost tea and singara spot popular with first-year students."
  },
  {
    id: "buet-lunch",
    universityId: "buet",
    title: "BUET Hall Lunch Corner",
    type: "cheap_food",
    latitude: 23.7274,
    longitude: 90.3947,
    priceHint: "Lunch ৳60-80",
    description: "Big portions, fast service, and one of the cheapest meal options near campus."
  },
  {
    id: "nsu-discount",
    universityId: "nsu",
    title: "Student Stationery Discount",
    type: "discount",
    latitude: 23.8158,
    longitude: 90.4248,
    priceHint: "10% student discount",
    description: "Show your ID card for semester notebook and printing discounts."
  },
  {
    id: "brac-coffee",
    universityId: "brac",
    title: "Budget Brew",
    type: "hangout",
    latitude: 23.7797,
    longitude: 90.4064,
    priceHint: "Coffee ৳80",
    description: "Cheaper coffee alternative to premium cafes, good for group study."
  },
  {
    id: "iub-lunchbox",
    universityId: "iub",
    title: "Lunchbox Hub",
    type: "cheap_food",
    latitude: 23.8268,
    longitude: 90.4263,
    priceHint: "Set meal ৳95",
    description: "Student meal combos and refill water near the campus gate."
  }
];
