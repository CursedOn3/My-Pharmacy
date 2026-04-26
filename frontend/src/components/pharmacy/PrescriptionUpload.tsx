import { useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { UploadCloud, FileText, X, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/api";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

const noteSchema = z
  .string()
  .trim()
  .max(300, { message: "Note must be under 300 characters" })
  .optional();

type Picked = { file: File; previewUrl: string | null };

const PrescriptionUploadCard = () => {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { addPrescription } = useStore();

  const handleFile = (file: File) => {
    setError(null);
    setConfirmed(false);
    if (!ALLOWED.includes(file.type)) {
      setError("Only JPG, PNG, WEBP or PDF files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be under 5MB.");
      return;
    }
    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;
    setPicked({ file, previewUrl });
  };

  const reset = () => {
    if (picked?.previewUrl) URL.revokeObjectURL(picked.previewUrl);
    setPicked(null);
    setError(null);
    setConfirmed(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    if (!picked) return;
    if (!user) {
      toast.error("Please sign in to upload a prescription");
      return;
    }
    const parsed = noteSchema.safeParse(note);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setUploading(true);
    try {
      const ext = picked.file.name.split(".").pop() || "file";
      const upload = await api.createPrescriptionUploadUrl({
        fileExt: ext,
        contentType: picked.file.type
      });
      const uploadRes = await fetch(upload.signedUrl, {
        method: "PUT",
        headers: { "content-type": picked.file.type },
        body: picked.file
      });
      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }
      const created = await api.createPrescription({
        path: upload.path,
        notes: parsed.data,
        file_name: picked.file.name,
        file_type: picked.file.type,
        file_size: picked.file.size,
        customer_email: user.email,
        customer_name: user.name
      });
      addPrescription({
        id: created.id,
        customerEmail: created.customer_email,
        customerName: created.customer_name,
        fileName: created.file_name,
        fileType: created.file_type,
        fileSize: created.file_size,
        previewUrl: picked.previewUrl,
        note: created.notes ?? undefined,
        status: "Pending",
        uploadedAt: created.created_at,
        reviewerNote: created.reviewer_note ?? undefined
      });
      setConfirmed(true);
      toast.success("Prescription received", {
        description: "A pharmacist will review it within 10 minutes."
      });
    } catch (err) {
      toast.error("Upload failed", { description: "Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-sun rounded-[2rem] p-6 md:p-10 grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <span className="text-xs font-bold text-primary-deep/60 uppercase tracking-wider">
          Fast & secure
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep leading-tight">
          Upload your prescription
        </h2>
        <p className="text-primary-deep/70 text-sm">
          Snap a clear photo or upload a PDF. A licensed pharmacist reviews it and prepares
          your order for 2-hour delivery.
        </p>
        <ul className="space-y-2 text-sm text-primary-deep">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> HIPAA-grade encryption
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Reviewed within 10 min
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Auto-refill reminders
          </li>
        </ul>
      </div>

      <div className="bg-background rounded-3xl p-5 md:p-6 shadow-soft space-y-4">
        {confirmed ? (
          <div className="text-center py-8 space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-mint flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-primary-deep" />
            </div>
            <h3 className="font-display text-xl font-extrabold text-primary-deep">
              Prescription uploaded!
            </h3>
            <p className="text-sm text-muted-foreground">
              We'll text you the moment a pharmacist confirms your order.
            </p>
            <button
              onClick={reset}
              className="text-xs font-semibold text-primary-deep underline underline-offset-4"
            >
              Upload another
            </button>
          </div>
        ) : (
          <>
            {!picked ? (
              <label
                htmlFor="rx-file"
                className="block border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-mint/30 transition-colors"
              >
                <UploadCloud className="h-10 w-10 mx-auto text-primary-deep mb-2" />
                <p className="font-semibold text-primary-deep text-sm">
                  Click to upload prescription
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP or PDF · max 5MB
                </p>
                <input
                  ref={inputRef}
                  id="rx-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
            ) : (
              <div className="border border-border rounded-2xl p-3 flex gap-3 items-center">
                {picked.previewUrl ? (
                  <img
                    src={picked.previewUrl}
                    alt="Prescription preview"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-mint flex items-center justify-center">
                    <FileText className="h-7 w-7 text-primary-deep" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-deep truncate">
                    {picked.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(picked.file.size / 1024).toFixed(0)} KB ·{" "}
                    {picked.file.type.split("/")[1].toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={reset}
                  aria-label="Remove file"
                  className="p-1.5 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="rx-note"
                className="text-xs font-semibold text-primary-deep"
              >
                Notes for pharmacist (optional)
              </label>
              <textarea
                id="rx-note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                rows={2}
                maxLength={300}
                placeholder="e.g. Please include generic options"
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="text-[10px] text-muted-foreground text-right">
                {note.length}/300
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-destructive">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={!picked || uploading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-deep text-primary-deep-foreground px-5 py-3 rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploading ? "Uploading..." : "Submit prescription"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const PrescriptionUpload = () => (
  <section id="prescription" className="container mx-auto px-4 py-10">
    <PrescriptionUploadCard />
  </section>
);

export { PrescriptionUploadCard };
export default PrescriptionUpload;
