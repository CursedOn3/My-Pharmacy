import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/products";

const Categories = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="group flex flex-col items-center gap-2"
          >
            <div
              className={`${c.bg} h-20 w-full rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:-translate-y-1`}
            >
              {c.emoji}
            </div>
            <span className="text-xs font-semibold text-primary-deep text-center">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
