import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";
import doctor from "@/assets/doctor.jpg";

const PromoStrip = () => {
  return (
    <section className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-4">
      <div className="bg-sun rounded-3xl p-6 flex items-center gap-5 relative overflow-hidden">
        <div className="flex-1 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-deep" />
          </div>
          <h3 className="font-display text-xl font-extrabold text-primary-deep">
            Upload prescription, get it delivered
          </h3>
          <Link
            to="/prescription"
            className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-sm font-semibold"
          >
            Upload now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="bg-peach rounded-3xl p-6 flex items-center gap-5 relative overflow-hidden">
        <div className="flex-1 space-y-3">
          <h3 className="font-display text-xl font-extrabold text-primary-deep">
            Don't have a prescription?
          </h3>
          <p className="text-sm text-primary-deep/70">
            Talk to a licensed doctor in minutes.
          </p>
          <button className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-sm font-semibold">
            Consult now <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <img
          src={doctor}
          alt="Doctor"
          loading="lazy"
          width={768}
          height={768}
          className="h-32 w-28 object-cover object-top rounded-2xl"
        />
      </div>
    </section>
  );
};

export default PromoStrip;
