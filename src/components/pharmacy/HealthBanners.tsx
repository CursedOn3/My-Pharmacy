const banners = [
  { title: "Natural Health and Science", discount: "5%", bg: "bg-sun" },
  { title: "Diabetic Care that lasts", discount: "10%", bg: "bg-mint" },
  { title: "Cold and Flu relief", discount: "10%", bg: "bg-peach" },
];

const HealthBanners = () => {
  return (
    <section className="container mx-auto px-4 py-4">
      <div className="grid md:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div
            key={b.title}
            className={`${b.bg} rounded-3xl p-6 flex justify-between items-center min-h-[140px] hover:scale-[1.01] transition-transform cursor-pointer`}
          >
            <div className="space-y-2 max-w-[55%]">
              <h3 className="font-display text-xl font-extrabold text-primary-deep leading-tight">
                {b.title}
              </h3>
              <button className="text-xs font-bold text-primary-deep underline underline-offset-4">
                Shop now →
              </button>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-primary-deep/60 uppercase">Up to</div>
              <div className="font-display text-5xl font-extrabold text-primary-deep">
                {b.discount}
              </div>
              <div className="text-xs font-bold text-primary-deep">OFF</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HealthBanners;
