import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Header from "@/components/pharmacy/Header";
import Hero from "@/components/pharmacy/Hero";
import SearchBar from "@/components/pharmacy/SearchBar";
import Categories from "@/components/pharmacy/Categories";
import ProductGrid from "@/components/pharmacy/ProductGrid";
import PromoStrip from "@/components/pharmacy/PromoStrip";
import Brands from "@/components/pharmacy/Brands";
import HealthBanners from "@/components/pharmacy/HealthBanners";
import CerealFeature from "@/components/pharmacy/CerealFeature";
import PrescriptionUpload from "@/components/pharmacy/PrescriptionUpload";
import Consultation from "@/components/pharmacy/Consultation";
import Testimonials from "@/components/pharmacy/Testimonials";
import CTABanners from "@/components/pharmacy/CTABanners";
import FAQ from "@/components/pharmacy/FAQ";
import AppDownload from "@/components/pharmacy/AppDownload";
import Footer from "@/components/pharmacy/Footer";
import { useCart } from "@/context/CartContext";
import { ALL, baby, todaysDeals, trending } from "@/lib/products";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { open } = useCart();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => Array.from(new Set(ALL.map((p) => p.category))),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL.filter((p) => {
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesC = category === "All" || p.category === category;
      return matchesQ && matchesC;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <SearchBar
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
          categories={categories}
          resultsCount={results.length}
          results={results}
          onPick={open}
        />
        <Categories />
        <ProductGrid title="Today's best deals" subtitle="for you!" products={todaysDeals} />
        <PromoStrip />
        
        <ProductGrid
          title="Trending products"
          subtitle="for you!"
          products={trending}
          tabs={["Babies", "Sun care", "Vitamins", "Hygiene", "Diabetic care", "First aid"]}
        />
        <HealthBanners />
        <ProductGrid title="Baby Food Collection" products={baby} seeAllSlug="baby" />
        <CerealFeature />
        <PrescriptionUpload />
        <Consultation />
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
