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
            to="/category/$slug"
            params={{ slug: "vitamins" }}
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
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                i === 0
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
        {products.map((p) => (
          <ProductCard key={p.name} p={p} />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
