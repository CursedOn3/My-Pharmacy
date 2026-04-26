import { ArrowRight, CreditCard } from "lucide-react";
import delivery from "@/assets/delivery.jpg";

const CTABanners = () => {
  return (
    <section className="container mx-auto px-4 py-4 grid md:grid-cols-2 gap-4">
      <div className="bg-mint rounded-3xl p-6 flex items-center gap-4 overflow-hidden">
        <div className="flex-1 space-y-3">
          <span className="inline-block bg-primary-deep text-primary-deep-foreground text-[10px] font-bold px-2 py-1 rounded-full">
            DELIVERY
          </span>
          <h3 className="font-display text-2xl font-extrabold text-primary-deep">
            Enjoy Free Delivery within 2 hours
          </h3>
          <button className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-sm font-semibold">
            Shop now <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <img
          src={delivery}
          alt="Delivery person"
          loading="lazy"
          width={768}
          height={768}
          className="h-36 w-32 object-cover object-top rounded-2xl"
        />
      </div>
      <div className="bg-sun rounded-3xl p-6 flex items-center gap-4 overflow-hidden">
        <div className="flex-1 space-y-3">
          <span className="inline-block bg-primary-deep text-primary-deep-foreground text-[10px] font-bold px-2 py-1 rounded-full">
            HEALTH CARD
          </span>
          <h3 className="font-display text-2xl font-extrabold text-primary-deep">
            You can enjoy a 5% discount with your health card
          </h3>
          <button className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-sm font-semibold">
            Get card <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="relative h-32 w-32 shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-accent rotate-6 shadow-soft" />
          <div className="absolute inset-0 rounded-2xl bg-primary-deep -rotate-3 flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-primary-deep-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanners;
