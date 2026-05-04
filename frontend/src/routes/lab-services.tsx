import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import {
  Droplet,
  HeartPulse,
  Activity,
  ShieldCheck,
  TestTube,
  Microscope,
  Stethoscope,
  Clock,
  CheckCircle2,
  CalendarClock,
  HomeIcon,
  Beaker,
} from "lucide-react";

export const Route = createFileRoute("/lab-services")({
  component: LabServicesPage,
  head: () => ({
    meta: [
      { title: "Lab Services & Blood Tests — Medicare" },
      {
        name: "description",
        content:
          "Book accurate, affordable blood tests at Medicare. CBC, lipid profile, diabetes, thyroid, vitamin & liver panels with home sample collection.",
      },
      { property: "og:title", content: "Lab Services & Blood Tests — Medicare" },
      {
        property: "og:description",
        content:
          "Wide range of blood tests with home sample collection and digital reports within 24 hours.",
      },
    ],
  }),
});

const tests = [
  {
    icon: Droplet,
    name: "Complete Blood Count (CBC)",
    desc: "Screens for anaemia, infection and many other disorders.",
    price: "$18",
    turnaround: "Same day",
    bg: "bg-mint",
  },
  {
    icon: HeartPulse,
    name: "Lipid Profile",
    desc: "Total, HDL, LDL cholesterol and triglycerides for heart health.",
    price: "$24",
    turnaround: "24 hours",
    bg: "bg-rose",
  },
  {
    icon: Activity,
    name: "Diabetes Panel (HbA1c + Fasting Glucose)",
    desc: "Tracks 3-month sugar average — gold standard for diabetes care.",
    price: "$29",
    turnaround: "24 hours",
    bg: "bg-sun",
  },
  {
    icon: TestTube,
    name: "Thyroid Profile (T3, T4, TSH)",
    desc: "Detects hyper/hypothyroid conditions affecting energy & weight.",
    price: "$32",
    turnaround: "24 hours",
    bg: "bg-peach",
  },
  {
    icon: Beaker,
    name: "Liver Function Test (LFT)",
    desc: "Assesses liver health, enzymes, bilirubin and proteins.",
    price: "$28",
    turnaround: "24 hours",
    bg: "bg-cream",
  },
  {
    icon: ShieldCheck,
    name: "Kidney Function Test (KFT)",
    desc: "Creatinine, urea, uric acid & electrolytes — essential annual check.",
    price: "$26",
    turnaround: "24 hours",
    bg: "bg-mint",
  },
  {
    icon: Microscope,
    name: "Vitamin D & B12 Panel",
    desc: "Energy, bone & nerve health — most commonly deficient vitamins.",
    price: "$34",
    turnaround: "48 hours",
    bg: "bg-sun",
  },
  {
    icon: Stethoscope,
    name: "Full Body Wellness Package",
    desc: "75+ parameters incl. CBC, lipid, sugar, thyroid, liver & kidney.",
    price: "$89",
    turnaround: "48 hours",
    bg: "bg-peach",
  },
];

const steps = [
  {
    icon: CalendarClock,
    title: "Book your test",
    desc: "Choose a test and pick a time that works — even early mornings.",
  },
  {
    icon: HomeIcon,
    title: "Free home collection",
    desc: "A certified phlebotomist visits with sealed, single-use kits.",
  },
  {
    icon: Microscope,
    title: "NABL-accredited lab",
    desc: "Samples processed in our partner accredited labs within hours.",
  },
  {
    icon: CheckCircle2,
    title: "Digital reports",
    desc: "Reports land in your dashboard. Doctor consult available free.",
  },
];

function LabServicesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="container mx-auto px-4 pt-8 pb-10">
          <div className="rounded-3xl gradient-hero p-8 md:p-14 relative overflow-hidden">
            <div className="max-w-2xl space-y-5 relative z-10">
              <span className="inline-block bg-background/20 backdrop-blur text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                Lab services
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-foreground leading-tight">
                Blood tests, made simple — at home or at the clinic.
              </h1>
              <p className="text-primary-foreground/90 text-base md:text-lg">
                Over 75 parameters, free home sample collection, NABL-accredited
                labs and digital reports in your dashboard within 24 hours.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#tests"
                  className="bg-background text-primary-deep font-bold text-sm px-5 py-3 rounded-full hover:scale-[1.02] transition-transform"
                >
                  View all tests
                </a>
                <Link
                  to="/contact"
                  className="bg-background/20 backdrop-blur text-primary-foreground font-bold text-sm px-5 py-3 rounded-full hover:bg-background/30 transition-colors"
                >
                  Talk to a phlebotomist
                </Link>
              </div>
            </div>

            <div className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-background/10 backdrop-blur items-center justify-center">
              <TestTube className="h-20 w-20 text-primary-foreground" />
            </div>
          </div>
        </section>

        {/* HIGHLIGHT STRIP */}
        <section className="container mx-auto px-4 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: HomeIcon, label: "Free home collection" },
              { icon: Clock, label: "Reports in 24 hrs" },
              { icon: ShieldCheck, label: "NABL accredited" },
              { icon: HeartPulse, label: "Free doctor consult" },
            ].map((b) => (
              <div
                key={b.label}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-mint flex items-center justify-center shrink-0">
                  <b.icon className="h-5 w-5 text-primary-deep" />
                </div>
                <span className="font-semibold text-primary-deep text-sm">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* TESTS GRID */}
        <section id="tests" className="container mx-auto px-4 pb-12">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
                Available tests
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
                Popular blood tests
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Prices shown are introductory. Packages include sample collection
              and a digital report.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((t) => (
              <article
                key={t.name}
                className="bg-card border border-border rounded-3xl p-5 shadow-card flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-2xl ${t.bg} flex items-center justify-center`}
                  >
                    <t.icon className="h-6 w-6 text-primary-deep" />
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-primary-deep">
                      {t.price}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      starting at
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-extrabold text-primary-deep text-lg leading-tight">
                    {t.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{t.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-deep/70">
                    <Clock className="h-3.5 w-3.5" />
                    {t.turnaround}
                  </div>
                  <Link
                    to="/contact"
                    className="text-xs font-bold bg-primary-deep text-primary-deep-foreground px-3 py-1.5 rounded-full hover:opacity-90"
                  >
                    Book now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="container mx-auto px-4 pb-12">
          <div className="bg-cream rounded-3xl p-8 md:p-10">
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
                How it works
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep mt-1">
                From booking to report — in 4 easy steps
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className="bg-background rounded-2xl p-5 relative"
                >
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary-deep text-primary-deep-foreground font-display font-extrabold text-sm flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-mint flex items-center justify-center mb-3">
                    <s.icon className="h-5 w-5 text-primary-deep" />
                  </div>
                  <h3 className="font-display font-extrabold text-primary-deep">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-12">
          <div className="rounded-3xl bg-primary-deep p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary-deep-foreground">
                Already have a doctor's prescription?
              </h2>
              <p className="text-primary-deep-foreground/80 mt-2 text-sm">
                Upload it from your dashboard — we'll match the right tests and
                schedule a home collection at your preferred slot.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="bg-background text-primary-deep font-bold text-sm px-6 py-3 rounded-full hover:scale-[1.02] transition-transform whitespace-nowrap"
            >
              Go to dashboard
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
