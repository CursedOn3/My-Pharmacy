import vitamins from "@/assets/product-vitamins.jpg";
import cold from "@/assets/product-cold.jpg";
import vitc from "@/assets/product-vitc.jpg";
import soap from "@/assets/product-soap.jpg";

export type Product = {
  id?: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  image: string;
  rating?: number;
  description?: string;
  stock?: number;
};

export const todaysDeals: Product[] = [
  { name: "Multivitamin Daily Wellness Capsules", brand: "Bliss", category: "Vitamins", price: "$12.99", oldPrice: "$18.99", discount: "30%", image: vitamins, rating: 4.8, description: "Daily multivitamin with essential B-complex, vitamin D and zinc to support energy and immunity." },
  { name: "Cold & Flu Relief Tablets 24ct", brand: "PureLife", category: "Cold & Flu", price: "$8.49", oldPrice: "$11.99", discount: "25%", image: cold, rating: 4.6, description: "Fast-acting symptom relief for cold, flu and seasonal congestion. Non-drowsy formula." },
  { name: "Vitamin C 1000mg Effervescent", brand: "Nuvanta", category: "Vitamins", price: "$6.99", oldPrice: "$9.99", discount: "30%", image: vitc, rating: 4.9, description: "High-potency vitamin C with zinc — orange flavored effervescent tablets." },
  { name: "Antibacterial Hand Soap 250ml", brand: "Forel", category: "Hygiene", price: "$4.99", oldPrice: "$7.49", discount: "30%", image: soap, rating: 4.7, description: "Gentle antibacterial cleanser, kills 99.9% of germs while keeping skin soft." },
];

export const trending: Product[] = [
  { name: "Vitamin C 1000mg Effervescent", brand: "Nuvanta", category: "Vitamins", price: "$6.99", image: vitc, rating: 4.9 },
  { name: "Multivitamin Daily Wellness", brand: "Bliss", category: "Vitamins", price: "$12.99", image: vitamins, rating: 4.8 },
  { name: "Antibacterial Hand Soap", brand: "Forel", category: "Hygiene", price: "$4.99", image: soap, rating: 4.7 },
  { name: "Cold & Flu Relief Tablets", brand: "PureLife", category: "Cold & Flu", price: "$8.49", image: cold, rating: 4.6 },
  { name: "Daily Health Capsules", brand: "Omega", category: "Wellness", price: "$15.49", image: vitamins, rating: 4.5 },
];

export const baby: Product[] = [
  { name: "Toddler Multivitamin Gummies", brand: "Bliss Kids", category: "Baby", price: "$10.99", image: vitamins, rating: 4.8 },
  { name: "Baby Mild Hand Wash", brand: "PureBaby", category: "Baby", price: "$5.49", image: soap, rating: 4.9 },
  { name: "Vitamin C for Kids", brand: "Nuvanta", category: "Baby", price: "$7.49", image: vitc, rating: 4.7 },
  { name: "Cold Relief Drops", brand: "PureLife", category: "Baby", price: "$6.99", image: cold, rating: 4.6 },
];

export const skincare: Product[] = [
  { name: "Antibacterial Hand Soap", brand: "Forel", category: "Skin care", price: "$4.99", image: soap, rating: 4.7 },
  { name: "Gentle Cleanser", brand: "PureLife", category: "Skin care", price: "$9.99", image: soap, rating: 4.5 },
  { name: "Daily Moisturizer", brand: "Bliss", category: "Skin care", price: "$14.99", image: vitc, rating: 4.6 },
];

export const wellness: Product[] = [
  { name: "Daily Health Capsules", brand: "Omega", category: "Wellness", price: "$15.49", image: vitamins, rating: 4.5 },
  { name: "Multivitamin Daily Wellness", brand: "Bliss", category: "Wellness", price: "$12.99", image: vitamins, rating: 4.8 },
  { name: "Cold & Flu Relief Tablets", brand: "PureLife", category: "Wellness", price: "$8.49", image: cold, rating: 4.6 },
];

export const ALL: Product[] = (() => {
  const seen = new Set<string>();
  return [...todaysDeals, ...trending, ...baby, ...skincare, ...wellness].filter((p) => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });
})();

export const CATEGORIES = [
  { slug: "vitamins", name: "Vitamins", emoji: "💊", bg: "bg-mint" },
  { slug: "skin-care", name: "Skin care", emoji: "🧴", bg: "bg-rose" },
  { slug: "wellness", name: "Wellness", emoji: "💪", bg: "bg-sun" },
  { slug: "baby", name: "Mom & baby", emoji: "🍼", bg: "bg-cream" },
  { slug: "hygiene", name: "Hygiene", emoji: "🧼", bg: "bg-peach" },
  { slug: "cold-flu", name: "Cold & Flu", emoji: "🤧", bg: "bg-mint" },
  { slug: "devices", name: "Devices", emoji: "🩺", bg: "bg-rose" },
  { slug: "beauty", name: "Beauty", emoji: "💄", bg: "bg-peach" },
];

export const slugToCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);

export const productsByCategorySlug = (slug: string): Product[] => {
  const cat = slugToCategory(slug);
  if (!cat) return [];
  // Match against product.category loosely
  const target = cat.name.toLowerCase();
  return ALL.filter((p) => {
    const pc = p.category.toLowerCase();
    if (target.includes("baby")) return pc === "baby";
    if (target.includes("cold")) return pc === "cold & flu";
    return pc === target;
  });
};
