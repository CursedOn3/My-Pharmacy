import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How do I take an online consultation with a doctor on Medicare?", a: "Go to the Consult tab, choose your specialty, and book a slot. A licensed doctor will join your video call within minutes." },
  { q: "Are your online doctors qualified?", a: "Yes — every doctor is board-certified and verified by our medical team." },
  { q: "Can I keep the same doctor for follow-ups?", a: "Absolutely. You can request the same doctor for follow-ups, building continuity of care." },
  { q: "What happens if I don't get a response from a doctor?", a: "We guarantee a response within 5 minutes or your consultation is free.", highlighted: true },
  { q: "Can I download my prescription from Medicare?", a: "Yes — every consultation generates a digital prescription you can download or share with any pharmacy." },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(3);
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep text-center mb-8">
        Got questions?
      </h2>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          const isHighlight = f.highlighted;
          return (
            <div
              key={i}
              className={`rounded-2xl border transition-colors ${
                isHighlight ? "bg-mint border-primary" : "bg-card border-border"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-primary-deep text-sm md:text-base pr-4">
                  {f.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-primary-deep transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-primary-deep/70 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
