import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import {
  Activity,
  HeartPulse,
  ShieldCheck,
  Clock,
  CheckCircle2,
  CalendarClock,
  HomeIcon,
  Bone,
  Baby,
  Brain,
  Dumbbell,
  Footprints,
  Hand,
  Stethoscope,
} from "lucide-react";

export const Route = createFileRoute("/physiotherapy")({
  component: PhysiotherapyPage,
  head: () => ({
    meta: [
      { title: "Physiotherapy Services — Medicare" },
      {
        name: "description",
        content:
          "Expert physiotherapy at Medicare. Orthopedic, sports, neuro, post-surgery & geriatric rehab — at our clinic or in the comfort of your home.",
      },
      { property: "og:title", content: "Physiotherapy Services — Medicare" },
      {
        property: "og:description",
        content:
          "Certified physiotherapists, personalized recovery plans and home-visit sessions across the city.",
      },
    ],
  }),
});

const services = [
  {
    icon: Bone,
    name: "Orthopedic Physiotherapy",
    desc: "Recovery from fractures, joint pain, arthritis and posture issues.",
    price: "$25",
    duration: "45 min",
    bg: "bg-mint",
  },
  {
    icon: Dumbbell,
    name: "Sports Injury Rehab",
    desc: "Targeted recovery for ligament tears, sprains and overuse injuries.",
    price: "$30",
    duration: "45 min",
    bg: "bg-rose",
  },
  {
    icon: Brain,
    name: "Neurological Rehab",
    desc: "Stroke, Parkinson's & spinal recovery with neuro-specialist therapists.",
    price: "$35",
    duration: "60 min",
    bg: "bg-sun",
  },
  {
    icon: HeartPulse,
    name: "Post-Surgery Recovery",
    desc: "Structured rehab after knee, hip or cardiac surgery — faster healing.",
    price: "$32",
    duration: "60 min",
    bg: "bg-peach",
  },
  {
    icon: Footprints,
    name: "Geriatric Physiotherapy",
    desc: "Mobility, balance and fall prevention programs for elderly care.",
    price: "$28",
    duration: "45 min",
    bg: "bg-cream",
  },
  {
    icon: Baby,
    name: "Pediatric Physiotherapy",
    desc: "Developmental therapy for infants and children with motor concerns.",
    price: "$30",
    duration: "45 min",
    bg: "bg-mint",
  },
  {
    icon: Hand,
    name: "Chronic Pain Management",
    desc: "Back, neck, shoulder & knee pain relief with manual therapy & dry needling.",
    price: "$26",
    duration: "45 min",
    bg: "bg-sun",
  },
  {
    icon: Stethoscope,
    name: "Cardio-Pulmonary Therapy",
    desc: "Breathing exercises and conditioning post-COVID, COPD or cardiac events.",
    price: "$30",
    duration: "45 min",
    bg: "bg-peach",
  },
];

const steps = [
  {
    icon: CalendarClock,
    title: "Book a session",
    desc: "Pick a service, therapist gender preference and time slot.",
  },
  {
    icon: HomeIcon,
    title: "Clinic or home visit",
    desc: "Visit our equipped clinic or have a therapist come to you.",
  },
  {
    icon: Activity,
    title: "Personalized plan",
    desc: "Assessment-based plan with measurable weekly goals.",
  },
  {
    icon: CheckCircle2,
    title: "Track progress",
    desc: "Session notes & progress reports synced to your dashboard.",
  },
];

function PhysiotherapyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="container mx-auto px-4 pt-8 pb-10">
          <div className="rounded-3xl gradient-hero p-8 md:p-14 relative overflow-hidden">
            <div className="max-w-2xl space-y-5 relative z-10">
              <span className="inline-block bg-background/20 backdrop-blur text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                Physiotherapy
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-foreground leading-tight">
                Move better, recover faster — with expert physiotherapists.
              </h1>
              <p className="text-primary-foreground/90 text-base md:text-lg">
                Certified therapists, evidence-based recovery plans and the
                option to train at our clinic or at home.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#services"
                  className="bg-background text-primary-deep font-bold text-sm px-5 py-3 rounded-full hover:scale-[1.02] transition-transform"
                >
                  View services
                </a>
                <Link
                  to="/contact"
                  className="bg-background/20 backdrop-blur text-primary-foreground font-bold text-sm px-5 py-3 rounded-full hover:bg-background/30 transition-colors"
                >
                  Talk to a therapist
                </Link>
              </div>
            </div>

            <div className="hidden md:flex absolute right-10 top-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-background/10 backdrop-blur items-center justify-center">
              <Activity className="h-20 w-20 text-primary-foreground" />
            </div>
          </div>
        </section>

        {/* HIGHLIGHT STRIP */}
        <section className="container mx-auto px-4 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: HomeIcon, label: "Home visits available" },
              { icon: Clock, label: "Flexible 7-day slots" },
              { icon: ShieldCheck, label: "Certified therapists" },
              { icon: HeartPulse, label: "Free initial assessment" },
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

        {/* SERVICES GRID */}
        <section id="services" className="container mx-auto px-4 pb-12">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-deep/60">
                What we treat
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
                Physiotherapy services
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Per-session pricing. Multi-session packages and home-visit add-ons
              available at checkout.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <article
                key={s.name}
                className="bg-card border border-border rounded-3xl p-5 shadow-card flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center`}
                  >
                    <s.icon className="h-6 w-6 text-primary-deep" />
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-primary-deep">
                      {s.price}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      per session
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-extrabold text-primary-deep text-lg leading-tight">
                    {s.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{s.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-deep/70">
                    <Clock className="h-3.5 w-3.5" />
                    {s.duration}
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
                Recovery in 4 guided steps
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
                Have a doctor's referral for physio?
              </h2>
              <p className="text-primary-deep-foreground/80 mt-2 text-sm">
                Upload it from your dashboard — we'll match you with the right
                specialist and schedule your first session.
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
