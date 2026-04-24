import { Search, X } from "lucide-react";
import type { Product } from "@/lib/products";

type Props = {
  query: string;
  onQuery: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  categories: string[];
  resultsCount: number;
  results: Product[];
  onPick: (p: Product) => void;
};

const SearchBar = ({
  query,
  onQuery,
  category,
  onCategory,
  categories,
  resultsCount,
  results,
  onPick,
}: Props) => {
  return (
    <section className="container mx-auto px-4 pt-4">
      <div className="bg-card border border-border rounded-3xl p-4 md:p-5 shadow-card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center bg-muted rounded-full px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value.slice(0, 100))}
              placeholder="Search medicines, vitamins, brands..."
              className="bg-transparent flex-1 outline-none px-3 text-sm"
              maxLength={100}
              aria-label="Search products"
            />
            {query && (
              <button
                onClick={() => onQuery("")}
                aria-label="Clear search"
                className="p-1 hover:bg-background rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {["All", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => onCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === c
                    ? "bg-primary-deep text-primary-deep-foreground"
                    : "bg-muted text-primary-deep hover:bg-mint"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {(query || category !== "All") && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              {resultsCount} result{resultsCount === 1 ? "" : "s"}
              {query && ` for "${query}"`}
              {category !== "All" && ` in ${category}`}
            </p>
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {results.slice(0, 8).map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onPick(p)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted text-left transition-colors"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                        {p.brand} · {p.category}
                      </p>
                      <p className="text-sm font-semibold text-primary-deep truncate">
                        {p.name}
                      </p>
                    </div>
                    <span className="font-bold text-primary-deep text-sm">{p.price}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No products match your search.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchBar;
