const AppDownload = () => {
  return (
    <section className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-4">
      <div className="bg-rose rounded-3xl p-8 space-y-4 relative overflow-hidden">
        <div className="grid grid-cols-3 gap-2 absolute top-4 right-4 opacity-60">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-lg bg-background/60" />
          ))}
        </div>
        <h3 className="font-display text-2xl font-extrabold text-primary-deep relative">
          Download Our<br />Healthcare App for<br />Easy Access
        </h3>
        <div className="flex gap-2 relative">
          <button className="bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-xl text-xs font-semibold">
            App Store
          </button>
          <button className="bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-xl text-xs font-semibold">
            Google Play
          </button>
        </div>
      </div>
      <div className="bg-sun rounded-3xl p-8 flex items-center gap-6 overflow-hidden">
        <div className="flex-1 space-y-2">
          <div className="font-display font-extrabold text-primary-deep">✓ Medicare</div>
          <p className="text-xs text-primary-deep/70">
            Track orders, refill prescriptions, chat with doctors — all in one place.
          </p>
        </div>
        <div className="h-40 w-24 rounded-2xl bg-background shadow-pop p-2 shrink-0">
          <div className="h-full w-full rounded-xl gradient-hero flex items-center justify-center font-display font-extrabold text-primary-deep text-2xl">
            M
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
