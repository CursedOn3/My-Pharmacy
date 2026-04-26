import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { ShieldCheck, Truck, HeartPulse, Users, Award, Leaf } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — Medicare Pharmacy" },
      {
        name: "description",
        content:
          "Learn about Medicare Pharmacy — our mission, licensed pharmacists, and commitment to fast, trusted healthcare delivery.",
      },
      { property: "og:title", content: "About Medicare Pharmacy" },
      {
        property: "og:description",
        content:
          "Our mission, values and the team behind Medicare's 2-hour delivery promise.",
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { value: "500K+", label: "Customers served" },
  { value: "120+", label: "Cities covered" },
  { value: "2 hr", label: "Average delivery" },
  { value: "4.9★", label: "Customer rating" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Licensed & verified",
    text: "Every medicine is sourced from licensed distributors and verified by our pharmacists.",
  },
  {
    icon: Truck,
    title: "Always on time",
    text: "Real-time tracking and a 2-hour delivery promise across major cities.",
  },
  {
    icon: HeartPulse,
    title: "Patient first",
    text: "Free consultations, refill reminders and care plans tailored to you.",
  },
  {
    icon: Users,
    title: "Expert pharmacists",
    text: "Talk to qualified pharmacists 24/7 — no appointment, no waiting room.",
  },
  {
    icon: Award,
    title: "Quality guaranteed",
    text: "100% authentic products with full money-back guarantee on every order.",
  },
  {
    icon: Leaf,
    title: "Sustainable packaging",
    text: "Recyclable insulation and minimal-plastic shipping for a healthier planet.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-10 pb-16">
        <div className="bg-cream rounded-3xl p-8 md:p-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-mint text-primary-deep text-xs font-bold uppercase px-3 py-1 rounded-full mb-4">
              About Medicare
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary-deep leading-tight">
              Healthcare that arrives at your door.
            </h1>
            <p className="mt-5 text-muted-foreground text-lg max-w-lg">
              We started Medicare in 2019 with a simple idea: nobody should wait
              days — or stand in line — for the medicine they need today. From a
              single neighborhood pharmacy, we now serve hundreds of thousands of
              families with same-day delivery, prescription uploads and 24/7
              pharmacist support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full bg-primary-deep text-primary-deep-foreground px-5 py-2.5 text-sm font-semibold hover:scale-105 transition-transform"
              >
                Contact us
              </Link>
              <Link
                to="/prescription"
                className="inline-flex items-center rounded-full bg-mint text-primary-deep px-5 py-2.5 text-sm font-semibold hover:bg-primary transition-colors"
              >
                Upload prescription
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-background rounded-2xl p-6 text-center shadow-sm"
              >
                <div className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
              Our mission
            </h2>
          </div>
          <div className="md:col-span-2 space-y-4 text-muted-foreground">
            <p>
              Make trusted healthcare effortlessly accessible — for everyone,
              every day. We combine licensed pharmacy expertise with thoughtful
              technology so that getting better never gets in the way of living.
            </p>
            <p>
              Whether it's a chronic prescription refill, a late-night fever, or
              a wellness routine you're building, Medicare is here to help — with
              honest advice, fair prices and a delivery network you can rely on.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep mb-8">
          What we stand for
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-cream rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-primary-deep flex items-center justify-center mb-4">
                <v.icon className="h-5 w-5 text-primary-deep-foreground" />
              </div>
              <h3 className="font-display font-extrabold text-primary-deep text-lg">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="bg-deep rounded-3xl p-10 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-primary-deep-foreground">
            Questions? We're here for you.
          </h2>
          <p className="mt-3 text-primary-deep-foreground/70 max-w-xl mx-auto">
            Our pharmacists and support team are available 24/7 — by chat, phone
            or email.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
