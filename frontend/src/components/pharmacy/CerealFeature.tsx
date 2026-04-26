import { Check, ArrowRight } from "lucide-react";
import cereal from "@/assets/cereal.jpg";

const CerealFeature = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-mint rounded-[2rem] p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center relative overflow-hidden">
        <div className="space-y-5">
          <span className="text-xs font-bold text-primary-deep/60 uppercase tracking-wider">
            Healthy breakfast
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
            Cereal Healthy Food
          </h2>
          <p className="text-primary-deep/70 text-sm">
            Whole grains, real fruits, no refined sugar — fuel for the whole family.
          </p>
          <ul className="space-y-2 text-sm">
            {["High in fiber & protein", "No artificial colors", "Family-size value pack"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2 text-primary-deep">
                  <span className="h-5 w-5 rounded-full bg-primary-deep text-primary-deep-foreground flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ),
            )}
          </ul>
          <button className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-6 py-3 rounded-full text-sm font-semibold">
            Buy now — $9.99 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">
          <img
            src={cereal}
            alt="Cereal box and bowl"
            loading="lazy"
            width={768}
            height={768}
            className="rounded-3xl w-full max-w-md mx-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default CerealFeature;
