import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import ProductCard from "@/components/pharmacy/ProductCard";
import { ALL, CATEGORIES, type Product } from "@/lib/products";
import { useStore } from "@/context/StoreContext";
import { Search, SlidersHorizontal, X, ChevronRight, Star } from "lucide-react";

const SORT_VALUES = ["featured", "price-asc", "price-desc", "rating", "discount", "name"] as const;
type SortValue = (typeof SORT_VALUES)[number];

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "all").default("all"),
  brand: fallback(z.string(), "all").default("all"),
  sort: fallback(z.enum(SORT_VALUES), "featured").default("featured"),
  min: fallback(z.number(), 0).default(0),
  max: fallback(z.number(), 100).default(100),
  rating: fallback(z.number(), 0).default(0),
  deals: fallback(z.boolean(), false).default(false),
});

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "All products — Medicare Pharmacy" },
      {
        name: "description",
        content:
          "Browse all Medicare Pharmacy products. Filter by category, brand, price and rating. 2-hour delivery and licensed pharmacists.",
      },
      { property: "og:title", content: "Shop all products — Medicare" },
      {
        property: "og:description",
        content:
          "Filter and sort thousands of pharmacy products. Free 2-hour delivery.",
      },
    ],
  }),
  component: ProductsPage,
});

const parsePrice = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;

const SORT_LABELS: Record<SortValue, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top rated",
  discount: "Biggest discount",
  name: "Name (A–Z)",
};

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { inventory } = useStore();

  const source = inventory.length ? inventory : ALL;

  const brands = useMemo(
    () => Array.from(new Set(source.map((p) => p.brand))).sort(),
    [source]
  );

  const filtered = useMemo(() => {
    let list: Product[] = source.slice();

    if (search.q.trim()) {
      const q = search.q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (search.category !== "all") {
      const cat = CATEGORIES.find((c) => c.slug === search.category);
      if (cat) {
        const target = cat.name.toLowerCase();
        list = list.filter((p) => {
          const pc = p.category.toLowerCase();
          if (target.includes("baby")) return pc === "baby";
          if (target.includes("cold")) return pc === "cold & flu";
          return pc === target;
        });
      }
    }

    if (search.brand !== "all") {
      list = list.filter((p) => p.brand === search.brand);
    }

    list = list.filter((p) => {
      const price = parsePrice(p.price);
      return price >= search.min && price <= search.max;
    });

    if (search.rating > 0) {
      list = list.filter((p) => (p.rating ?? 0) >= search.rating);
    }

    if (search.deals) {
      list = list.filter((p) => Boolean(p.discount));
    }

    switch (search.sort) {
      case "price-asc":
        list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "discount":
        list.sort(
          (a, b) =>
            parseInt(b.discount ?? "0", 10) - parseInt(a.discount ?? "0", 10)
        );
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return list;
  }, [search, source]);

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });

  const reset = () =>
    navigate({
      search: {
        q: "",
        category: "all",
        brand: "all",
        sort: "featured",
        min: 0,
        max: 100,
        rating: 0,
        deals: false,
      },
    });

  const activeFilterCount =
    (search.q ? 1 : 0) +
    (search.category !== "all" ? 1 : 0) +
    (search.brand !== "all" ? 1 : 0) +
    (search.rating > 0 ? 1 : 0) +
    (search.deals ? 1 : 0) +
    (search.min > 0 || search.max < 100 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary-deep">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary-deep font-semibold">All products</span>
        </nav>

        {/* Hero */}
        <header className="bg-cream rounded-3xl p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-block bg-mint text-primary-deep text-[10px] font-bold uppercase px-2.5 py-1 rounded-full mb-3">
                Shop
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary-deep">
                All products
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {filtered.length} product{filtered.length === 1 ? "" : "s"}{" "}
                available · 2-hour delivery
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center bg-background rounded-full px-4 py-2.5 shadow-sm md:min-w-[360px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search.q}
                onChange={(e) => update({ q: e.target.value })}
                placeholder="Search products, brands, categories..."
                className="bg-transparent flex-1 outline-none px-3 text-sm"
              />
              {search.q && (
                <button
                  onClick={() => update({ q: "" })}
                  className="text-muted-foreground hover:text-primary-deep"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => update({ category: "all" })}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                search.category === "all"
                  ? "bg-primary-deep text-primary-deep-foreground"
                  : "bg-background text-primary-deep hover:bg-muted"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => update({ category: c.slug })}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  search.category === c.slug
                    ? "bg-primary-deep text-primary-deep-foreground"
                    : "bg-background text-primary-deep hover:bg-muted"
                }`}
              >
                <span>{c.emoji}</span>
                {c.name}
              </button>
            ))}
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="lg:hidden inline-flex items-center gap-2 bg-muted text-primary-deep px-4 py-2 rounded-full text-sm font-semibold"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-muted-foreground font-semibold">
              Sort by
            </label>
            <select
              value={search.sort}
              onChange={(e) => update({ sort: e.target.value as SortValue })}
              className="bg-muted rounded-full px-4 py-2 text-sm font-semibold text-primary-deep outline-none cursor-pointer"
            >
              {SORT_VALUES.map((v) => (
                <option key={v} value={v}>
                  {SORT_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar filters */}
          <aside
            className={`${filtersOpen ? "block" : "hidden"} lg:block bg-cream rounded-3xl p-5 space-y-6 h-fit lg:sticky lg:top-24`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-primary-deep">
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={reset}
                  className="text-xs font-semibold text-primary-deep underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Deals toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-semibold text-primary-deep">
                On sale only
              </span>
              <input
                type="checkbox"
                checked={search.deals}
                onChange={(e) => update({ deals: e.target.checked })}
                className="h-4 w-4 accent-primary-deep"
              />
            </label>

            {/* Price */}
            <div>
              <h3 className="text-xs font-bold uppercase text-primary-deep tracking-wide mb-3">
                Price range
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={search.min}
                  onChange={(e) =>
                    update({ min: Math.max(0, Number(e.target.value) || 0) })
                  }
                  className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none"
                  placeholder="Min"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="number"
                  min={0}
                  value={search.max}
                  onChange={(e) =>
                    update({ max: Math.max(0, Number(e.target.value) || 0) })
                  }
                  className="w-full bg-background rounded-lg px-3 py-2 text-sm outline-none"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={search.max}
                onChange={(e) => update({ max: Number(e.target.value) })}
                className="w-full mt-3 accent-primary-deep"
              />
            </div>

            {/* Brand */}
            <div>
              <h3 className="text-xs font-bold uppercase text-primary-deep tracking-wide mb-3">
                Brand
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="brand"
                    checked={search.brand === "all"}
                    onChange={() => update({ brand: "all" })}
                    className="accent-primary-deep"
                  />
                  <span className="text-primary-deep">All brands</span>
                </label>
                {brands.map((b) => (
                  <label
                    key={b}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={search.brand === b}
                      onChange={() => update({ brand: b })}
                      className="accent-primary-deep"
                    />
                    <span className="text-primary-deep">{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-xs font-bold uppercase text-primary-deep tracking-wide mb-3">
                Minimum rating
              </h3>
              <div className="space-y-2">
                {[0, 4, 4.5, 4.8].map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={search.rating === r}
                      onChange={() => update({ rating: r })}
                      className="accent-primary-deep"
                    />
                    <span className="text-primary-deep flex items-center gap-1">
                      {r === 0 ? (
                        "Any rating"
                      ) : (
                        <>
                          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                          {r}+
                        </>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <section>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((p) => (
                  <ProductCard key={p.name} p={p} />
                ))}
              </div>
            ) : (
              <div className="bg-cream rounded-3xl p-10 text-center space-y-3">
                <p className="text-primary-deep/70">
                  No products match your filters.
                </p>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
                >
                  Reset filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
