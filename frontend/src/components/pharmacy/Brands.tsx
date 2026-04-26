const brands = [
  { name: "Bliss", color: "bg-mint" },
  { name: "Nuvanta", color: "bg-rose" },
  { name: "PureLife", color: "bg-peach" },
  { name: "Omega", color: "bg-deep" },
  { name: "ByVue", color: "bg-sun" },
  { name: "Forel", color: "bg-cream" },
];

const Brands = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-5">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary-deep">
          Featured Brands
        </h2>
        <span className="text-xs font-bold text-primary-deep">SEE ALL →</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {brands.map((b) => (
          <div
            key={b.name}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div
              className={`${b.color} h-20 w-20 rounded-full flex items-center justify-center font-display font-bold text-sm shadow-card group-hover:scale-105 transition-transform`}
            >
              {b.name}
            </div>
            <span className="text-xs text-muted-foreground">Brand</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Brands;
