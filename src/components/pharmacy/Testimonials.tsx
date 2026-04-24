import { Star } from "lucide-react";

const reviews = [
  { name: "Sara M.", text: "Delivered in under 2 hours. The pharmacist even called to confirm dosage. 10/10.", rating: 5 },
  { name: "Liam K.", text: "I love how easy it is to upload a prescription and reorder. Saves me hours every month.", rating: 5 },
  { name: "Priya R.", text: "Great prices on vitamins and the packaging is always perfect. My go-to pharmacy now.", rating: 5 },
  { name: "Marcus T.", text: "Customer service is unmatched. They genuinely care about your health journey.", rating: 5 },
];

const Testimonials = () => {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary-deep">
          What our Customers say
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
            ))}
          </div>
          <span className="font-semibold text-primary-deep">4.9</span>
          <span className="text-muted-foreground">/ 12k reviews</span>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {reviews.map((r) => (
          <div
            key={r.name}
            className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-3"
          >
            <div className="flex">
              {[...Array(r.rating)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-primary-deep/80 leading-relaxed">"{r.text}"</p>
            <div className="pt-2 border-t border-border">
              <div className="text-sm font-bold text-primary-deep">{r.name}</div>
              <div className="text-xs text-muted-foreground">Verified buyer</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
