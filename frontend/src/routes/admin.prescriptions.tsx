import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, type PrescriptionStatus } from "@/context/StoreContext";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/prescriptions")({
  component: AdminPrescriptionsPage,
  head: () => ({
    meta: [{ title: "Review Prescriptions — Admin" }],
  }),
});

const STATUSES: PrescriptionStatus[] = ["Pending", "Approved", "Rejected"];

const statusColor = (s: PrescriptionStatus) => {
  switch (s) {
    case "Pending":
      return "bg-peach text-primary-deep";
    case "Approved":
      return "bg-mint text-primary-deep";
    case "Rejected":
      return "bg-destructive/15 text-destructive";
  }
};

function AdminPrescriptionsPage() {
  const { prescriptions, updatePrescription } = useStore();
  const [filter, setFilter] = useState<"All" | PrescriptionStatus>("All");
  const [active, setActive] = useState<string | null>(null);
  const [reviewerNote, setReviewerNote] = useState("");

  const filtered = useMemo(() => {
    return prescriptions.filter(
      (rx) => filter === "All" || rx.status === filter,
    );
  }, [prescriptions, filter]);

  const activeRx = active
    ? prescriptions.find((r) => r.id === active) ?? null
    : null;

  const counts = useMemo(
    () => ({
      pending: prescriptions.filter((p) => p.status === "Pending").length,
      approved: prescriptions.filter((p) => p.status === "Approved").length,
      rejected: prescriptions.filter((p) => p.status === "Rejected").length,
    }),
    [prescriptions],
  );

  const handleDecision = async (status: PrescriptionStatus) => {
    if (!activeRx) return;
    try {
      await updatePrescription(activeRx.id, { status, reviewerNote });
      toast.success(`${activeRx.id} ${status.toLowerCase()}`);
      setActive(null);
      setReviewerNote("");
    } catch (err) {
      toast.error("Failed to update prescription");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Mini label="Pending" value={counts.pending} bg="bg-peach" icon={Clock} />
        <Mini
          label="Approved"
          value={counts.approved}
          bg="bg-mint"
          icon={CheckCircle2}
        />
        <Mini
          label="Rejected"
          value={counts.rejected}
          bg="bg-rose"
          icon={XCircle}
        />
      </div>

      <div className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display text-lg font-extrabold text-primary-deep">
            Prescription queue
          </h2>
          <div className="flex gap-2">
            {(["All", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === s
                    ? "bg-primary-deep text-primary-deep-foreground"
                    : "bg-muted text-primary-deep hover:bg-mint"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-cream rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-extrabold text-primary-deep">
              No prescriptions in this view
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              When customers upload prescriptions, they'll appear here for review.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((rx) => (
              <div
                key={rx.id}
                className="border border-border rounded-2xl p-4 bg-background space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-primary-deep">
                      {rx.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rx.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor(
                      rx.status,
                    )}`}
                  >
                    {rx.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-mint flex items-center justify-center overflow-hidden shrink-0">
                    {rx.previewUrl ? (
                      <img
                        src={rx.previewUrl}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileText className="h-6 w-6 text-primary-deep" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary-deep truncate">
                      {rx.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {rx.customerEmail}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {rx.fileName}
                    </p>
                  </div>
                </div>
                {rx.note && (
                  <p className="text-xs text-primary-deep/70 italic line-clamp-2">
                    "{rx.note}"
                  </p>
                )}
                <button
                  onClick={() => {
                    setActive(rx.id);
                    setReviewerNote(rx.reviewerNote ?? "");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full py-2 text-xs font-semibold hover:scale-[1.01] transition-transform"
                >
                  <Eye className="h-3.5 w-3.5" /> Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!activeRx}
        onOpenChange={(o) => {
          if (!o) {
            setActive(null);
            setReviewerNote("");
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-3xl">
          {activeRx && (
            <div className="space-y-4">
              <div>
                <DialogTitle className="font-display text-2xl font-extrabold text-primary-deep">
                  {activeRx.id}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  From {activeRx.customerName} ({activeRx.customerEmail}) —{" "}
                  {new Date(activeRx.uploadedAt).toLocaleString()}
                </DialogDescription>
              </div>

              <div className="bg-mint rounded-2xl p-4 flex items-center justify-center min-h-[180px]">
                {activeRx.previewUrl ? (
                  <img
                    src={activeRx.previewUrl}
                    alt="Prescription"
                    className="max-h-72 rounded-xl object-contain"
                  />
                ) : (
                  <div className="text-center text-primary-deep/70 space-y-2">
                    <ImageIcon className="h-10 w-10 mx-auto" />
                    <p className="text-xs">
                      Preview not available (PDF or restored from storage).
                    </p>
                    <p className="text-xs font-semibold">{activeRx.fileName}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="File" value={activeRx.fileName} />
                <Field label="Type" value={activeRx.fileType || "—"} />
                <Field
                  label="Size"
                  value={`${(activeRx.fileSize / 1024).toFixed(0)} KB`}
                />
                <Field label="Status" value={activeRx.status} />
              </div>

              {activeRx.note && (
                <div className="bg-cream rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary-deep/60 mb-1">
                    Customer note
                  </div>
                  <p className="text-sm text-primary-deep">{activeRx.note}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary-deep">
                  Reviewer note (optional)
                </label>
                <textarea
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value.slice(0, 300))}
                  rows={2}
                  className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="e.g. Approved — generic equivalent dispatched"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleDecision("Rejected")}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-destructive/10 text-destructive rounded-full py-3 text-sm font-semibold hover:bg-destructive/20 transition-colors"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => handleDecision("Approved")}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground rounded-full py-3 text-sm font-semibold hover:scale-[1.01] transition-transform"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className="h-10 w-10 rounded-xl bg-background/70 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary-deep" />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary-deep/70">
          {label}
        </div>
        <div className="font-display text-2xl font-extrabold text-primary-deep">
          {value}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-xl px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary-deep/60">
        {label}
      </div>
      <div className="text-sm font-semibold text-primary-deep truncate">
        {value}
      </div>
    </div>
  );
}
