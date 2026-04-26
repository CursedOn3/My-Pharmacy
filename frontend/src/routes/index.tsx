import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Header from "@/components/pharmacy/Header";
import Hero from "@/components/pharmacy/Hero";
import Categories from "@/components/pharmacy/Categories";
import ProductGrid from "@/components/pharmacy/ProductGrid";
import Brands from "@/components/pharmacy/Brands";
import HealthBanners from "@/components/pharmacy/HealthBanners";
import CerealFeature from "@/components/pharmacy/CerealFeature";
import Testimonials from "@/components/pharmacy/Testimonials";
import CTABanners from "@/components/pharmacy/CTABanners";
import FAQ from "@/components/pharmacy/FAQ";
import AppDownload from "@/components/pharmacy/AppDownload";
import Footer from "@/components/pharmacy/Footer";
import { ALL, baby, todaysDeals, trending } from "@/lib/products";
import { useStore } from "@/context/StoreContext";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const { inventory } = useStore();

  const source = inventory.length ? inventory : ALL;
  const deals = inventory.length ? source.slice(0, 4) : todaysDeals;
  const hot = inventory.length ? source.slice(4, 8) : trending;
  const babyList = inventory.length
    ? source.filter((p) => p.category.toLowerCase().includes("baby")).slice(0, 4)
    : baby;

  const categories = useMemo(
    () => Array.from(new Set(source.map((p) => p.category))),
    [source],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter((p) => {
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesC = category === "All" || p.category === category;
      return matchesQ && matchesC;
    });
  }, [query, category, source]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <ProductGrid title="Today's best deals" subtitle="for you!" products={deals} />
        <ProductGrid
          title="Trending products"
          subtitle="for you!"
          products={hot}
          tabs={["Babies", "Sun care", "Vitamins", "Hygiene", "Diabetic care", "First aid"]}
        />
        <HealthBanners />
        <ProductGrid title="Baby Food Collection" products={babyList} seeAllSlug="baby" />
        <CerealFeature />
        <Brands />
        <Testimonials />
        <CTABanners />
        <FAQ />
        <AppDownload />
        <Footer />
      </main>
    </div>
  );
}
