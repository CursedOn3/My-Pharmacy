import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import ProductCard from "@/components/pharmacy/ProductCard";
import { ALL, CATEGORIES, slugToCategory } from "@/lib/products";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useMemo } from "react";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => {
    const cat = slugToCategory(params.slug);
    const title = cat ? `${cat.name} — Medicare` : "Category — Medicare";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: cat
            ? `Shop ${cat.name} at Medicare Pharmacy. Fast 2-hour delivery and licensed pharmacists.`
            : "Browse pharmacy categories at Medicare.",
        },
        { property: "og:title", content: title },
      ],
    };
  },
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = slugToCategory(slug);
  const { inventory } = useStore();
  const source = inventory.length ? inventory : ALL;

  const products = useMemo(() => {
    if (!cat) return [];
    const target = cat.name.toLowerCase();
    return source.filter((p) => {
      const pc = p.category.toLowerCase();
      if (target.includes("baby")) return pc.includes("baby");
      if (target.includes("cold")) return pc.includes("cold");
      return pc === target;
    });
  }, [cat, source]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary-deep">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>Categories</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary-deep font-semibold">
            {cat?.name ?? "Unknown"}
          </span>
        </nav>

        {cat ? (
          <header
            className={`${cat.bg} rounded-[2rem] p-8 md:p-12 flex items-center gap-6`}
          >
            <div className="text-6xl md:text-7xl">{cat.emoji}</div>
            <div className="flex-1">
              <span className="text-xs font-bold text-primary-deep/60 uppercase tracking-wider">
                Category
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary-deep">
                {cat.name}
              </h1>
              <p className="text-primary-deep/70 text-sm mt-2">
                {products.length} product{products.length === 1 ? "" : "s"} available
              </p>
            </div>
          </header>
        ) : (
          <header className="bg-muted rounded-[2rem] p-12 text-center">
            <h1 className="font-display text-3xl font-extrabold text-primary-deep">
              Category not found
            </h1>
          </header>
        )}

        <section>
          <h2 className="sr-only">Products in {cat?.name}</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {products.map((p) => (
                <ProductCard key={p.name} p={p} />
              ))}
            </div>
          ) : (
            <div className="bg-cream rounded-3xl p-10 text-center space-y-3">
              <p className="text-primary-deep/70">
                We don't have products in this category yet.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-5 py-2.5 rounded-full text-sm font-semibold"
              >
                Browse all products
              </Link>
            </div>
          )}
        </section>

        <section className="pt-4">
          <h2 className="font-display text-xl font-extrabold text-primary-deep mb-4">
            Other categories
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={`${c.bg} h-16 w-full rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:-translate-y-1`}
                >
                  {c.emoji}
                </div>
                <span className="text-[11px] font-semibold text-primary-deep text-center">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
