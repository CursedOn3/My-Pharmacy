import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — Medicare Pharmacy" },
      {
        name: "description",
        content:
          "Get in touch with Medicare Pharmacy. 24/7 pharmacist support by chat, phone or email. We respond within minutes.",
      },
      { property: "og:title", content: "Contact Medicare Pharmacy" },
      {
        property: "og:description",
        content:
          "24/7 support from licensed pharmacists. Reach us by chat, phone or email.",
      },
    ],
  }),
  component: ContactPage,
});

const channels = [
  {
    icon: Phone,
    title: "Call us",
    value: "+1 (800) 555-0199",
    detail: "24/7 pharmacist hotline",
  },
  {
    icon: Mail,
    title: "Email",
    value: "support@medicare.app",
    detail: "Replies within 1 hour",
  },
  {
    icon: MessageCircle,
    title: "Live chat",
    value: "Start a conversation",
    detail: "Average wait: under 2 min",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    value: "350 Wellness Ave, NY 10001",
    detail: "Mon–Sat, 9am–7pm",
  },
];

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Message sent! We'll get back to you within 1 hour.");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="container mx-auto px-4 pt-10 pb-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block bg-mint text-primary-deep text-xs font-bold uppercase px-3 py-1 rounded-full mb-4">
            We're here to help
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary-deep leading-tight">
            Talk to a real pharmacist.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Questions about a prescription, an order, or your wellness routine?
            Our team responds in minutes — every day, all day.
          </p>
        </div>
      </section>

      {/* Channels */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((c) => (
            <div
              key={c.title}
              className="bg-cream rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-primary-deep flex items-center justify-center mb-4">
                <c.icon className="h-5 w-5 text-primary-deep-foreground" />
              </div>
              <div className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
                {c.title}
              </div>
              <div className="mt-1 font-display font-extrabold text-primary-deep">
                {c.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{c.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-background border border-border rounded-3xl p-6 md:p-10">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary-deep">
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill in the form below and we'll get back to you within an hour.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-primary-deep uppercase">
                    Full name
                  </label>
                  <input
                    required
                    type="text"
                    className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary-deep uppercase">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-primary-deep uppercase">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 555 000 0000"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary-deep uppercase">
                    Topic
                  </label>
                  <select
                    required
                    className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    <option>Order question</option>
                    <option>Prescription help</option>
                    <option>Pharmacist consultation</option>
                    <option>Billing</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary-deep uppercase">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  className="mt-1 w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-primary-deep text-primary-deep-foreground px-6 py-3 text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Sending..." : "Send message"}
              </button>
            </form>
          </div>

          <aside className="bg-cream rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-deep" />
                <h3 className="font-display font-extrabold text-primary-deep">
                  Support hours
                </h3>
              </div>
              <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                <li className="flex justify-between">
                  <span>Pharmacist hotline</span>
                  <span className="font-semibold text-primary-deep">24/7</span>
                </li>
                <li className="flex justify-between">
                  <span>Live chat</span>
                  <span className="font-semibold text-primary-deep">24/7</span>
                </li>
                <li className="flex justify-between">
                  <span>Email</span>
                  <span className="font-semibold text-primary-deep">
                    Mon–Sun
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-deep" />
                <h3 className="font-display font-extrabold text-primary-deep">
                  Visit us
                </h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                350 Wellness Ave
                <br />
                New York, NY 10001
                <br />
                United States
              </p>
            </div>

            <div className="bg-deep rounded-2xl p-5 text-primary-deep-foreground">
              <h3 className="font-display font-extrabold">Emergency?</h3>
              <p className="mt-1 text-sm text-primary-deep-foreground/70">
                If you have a medical emergency, please call 911 or visit your
                nearest emergency room.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
