import { Link } from "@tanstack/react-router";
import { ArrowRight, Truck, ShieldCheck } from "lucide-react";
import hero from "@/assets/hero-pharmacist.jpg";

const Hero = () => {
  return (
    <section className="container mx-auto px-4 pt-6">
      <div className="relative overflow-hidden rounded-[2rem] gradient-hero p-8 md:p-12 lg:p-16">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-secondary/40 blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              UPDATED PRESCRIPTIONS
            </span>
            <h1 className="font-display font-extrabold text-primary-deep text-5xl md:text-7xl lg:text-8xl leading-[0.9]">
              Pharmacy<span className="text-primary-deep/80">.</span>
            </h1>
            <p className="text-primary-deep/80 max-w-md text-base md:text-lg">
              Trusted medicine delivery in 2 hours. Real pharmacists, real care, real fast — straight to your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/prescription"
                className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-6 py-3.5 rounded-full font-semibold shadow-pop hover:scale-[1.02] transition-transform"
              >
                Upload prescription <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/category/$slug"
                params={{ slug: "vitamins" }}
                className="inline-flex items-center gap-2 bg-white/90 text-primary-deep px-6 py-3.5 rounded-full font-semibold hover:bg-white transition-colors"
              >
                Shop now
              </Link>
            </div>
            <div className="flex flex-wrap gap-5 pt-2 text-sm text-primary-deep">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free 2-hr delivery</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Licensed pharmacists</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl" />
            <img
              src={hero}
              alt="Medicare pharmacist holding a delivery package"
              className="relative w-full max-w-md mx-auto rounded-3xl object-cover"
              width={1024}
              height={1024}
            />
            <div className="absolute top-4 right-4 bg-background rounded-2xl shadow-soft px-4 py-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-primary-deep">100% Genuine</div>
                <div className="text-muted-foreground">Verified meds</div>
              </div>
            </div>
            <div className="absolute bottom-4 left-2 bg-background rounded-2xl shadow-soft px-4 py-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-7 w-7 rounded-full bg-accent border-2 border-background" />
                <div className="h-7 w-7 rounded-full bg-secondary border-2 border-background" />
                <div className="h-7 w-7 rounded-full bg-primary border-2 border-background" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-primary-deep">12k+ orders</div>
                <div className="text-muted-foreground">delivered today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
