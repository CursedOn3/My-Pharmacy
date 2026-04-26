import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";

type Props = {
  title: string;
  subtitle?: string;
  products: Product[];
  tabs?: string[];
  seeAllSlug?: string;
};

const ProductGrid = ({ title, subtitle, products, tabs, seeAllSlug }: Props) => {
  const [activeTab, setActiveTab] = useState<string | null>(tabs?.[0] ?? null);

  const visibleProducts = useMemo(() => {
    if (!tabs?.length || !activeTab) return products;

    const normalizedTab = activeTab.toLowerCase();
    const tabToCategory: Record<string, string> = {
      babies: "baby",
      "sun care": "skin care",
      vitamins: "vitamins",
      hygiene: "hygiene",
      "diabetic care": "wellness",
      "first aid": "cold & flu",
    };

    const targetCategory = tabToCategory[normalizedTab];
    if (!targetCategory) return products;

    const filtered = products.filter(
      (p) => p.category.toLowerCase() === targetCategory,
    );

    // Keep the section populated if the current dataset has no exact match.
    return filtered.length > 0 ? filtered : products;
  }, [activeTab, products, tabs]);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary-deep leading-tight">
            {title}
          </h2>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        {seeAllSlug ? (
          <Link
            to="/category/$slug"
            params={{ slug: seeAllSlug }}
            className="text-xs font-bold text-primary-deep inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            SEE ALL <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <Link
            to="/products"
            className="text-xs font-bold text-primary-deep inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            SEE ALL PRODUCTS <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {tabs && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              aria-pressed={activeTab === t}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                (activeTab ?? tabs[0]) === t
                  ? "bg-primary-deep text-primary-deep-foreground"
                  : "bg-muted text-primary-deep hover:bg-mint"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {visibleProducts.map((p) => (
          <ProductCard key={p.name} p={p} />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
