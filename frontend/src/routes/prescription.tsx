import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/pharmacy/Header";
import Footer from "@/components/pharmacy/Footer";
import { PrescriptionUploadCard } from "@/components/pharmacy/PrescriptionUpload";

export const Route = createFileRoute("/prescription")({
  component: PrescriptionPage,
  head: () => ({
    meta: [
      { title: "Upload Prescription — Medicare" },
      {
        name: "description",
        content:
          "Upload your prescription to Medicare Pharmacy and get medicines delivered in 2 hours.",
      },
      { property: "og:title", content: "Upload Prescription — Medicare" },
    ],
  }),
});

function PrescriptionPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-block bg-mint text-primary-deep px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Prescription
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-deep mt-3">
            Send us your prescription
          </h1>
          <p className="text-primary-deep/70 mt-3">
            Upload a clear photo or PDF — a licensed pharmacist will review it within 10
            minutes and prepare your order for 2-hour delivery.
          </p>
        </div>
        <PrescriptionUploadCard />

        <section className="mt-10 grid md:grid-cols-3 gap-4">
          {[
            { n: "1", t: "Upload", d: "Snap a photo of your prescription or upload a PDF." },
            { n: "2", t: "Pharmacist review", d: "A licensed pharmacist verifies and prepares your meds." },
            { n: "3", t: "2-hour delivery", d: "We dispatch your order with secure, tracked delivery." },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-card border border-border rounded-2xl p-6 space-y-2 shadow-card"
            >
              <div className="h-9 w-9 rounded-full bg-primary-deep text-primary-deep-foreground font-display font-extrabold flex items-center justify-center">
                {s.n}
              </div>
              <h3 className="font-display font-extrabold text-primary-deep">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
