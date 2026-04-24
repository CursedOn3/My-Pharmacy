import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { useStore, type InventoryItem } from "@/context/StoreContext";
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Trash2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
  head: () => ({
    meta: [{ title: "Inventory — Admin" }],
  }),
});

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(120, { message: "Name must be under 120 characters" }),
  description: z
    .string()
    .trim()
    .min(5, { message: "Add a short description" })
    .max(500, { message: "Description must be under 500 characters" }),
  price: z
    .number({ message: "Enter a valid price" })
    .min(0.01, { message: "Price must be greater than 0" })
    .max(10000, { message: "Price must be under $10,000" }),
  stock: z
    .number({ message: "Enter a valid stock count" })
    .int({ message: "Stock must be a whole number" })
    .min(0, { message: "Stock cannot be negative" })
    .max(100000, { message: "Stock too large" }),
  image: z
    .string()
    .trim()
    .min(1, { message: "Image is required" })
    .max(2_000_000, { message: "Image too large" }),
});

const LOW_STOCK = 5;

function AdminInventoryPage() {
  const { inventory, addProduct, updateProduct, deleteProduct } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.brand ?? "").toLowerCase().includes(q) ||
        (i.category ?? "").toLowerCase().includes(q),
    );
  }, [inventory, query]);

  const stats = useMemo(() => {
    const total = inventory.length;
    const out = inventory.filter((i) => i.stock === 0).length;
    const low = inventory.filter((i) => i.stock > 0 && i.stock <= LOW_STOCK)
      .length;
    const units = inventory.reduce((s, i) => s + i.stock, 0);
    return { total, out, low, units };
  }, [inventory]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Boxes} label="Products" value={stats.total} bg="bg-mint" />
        <Stat
          icon={CheckCircle2}
          label="Units in stock"
          value={stats.units}
          bg="bg-sun"
        />
        <Stat
          icon={AlertTriangle}
          label={`Low (≤${LOW_STOCK})`}
          value={stats.low}
          bg="bg-peach"
        />
        <Stat
          icon={AlertTriangle}
          label="Out of stock"
          value={stats.out}
          bg="bg-rose"
        />
      </div>

      <div className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-lg font-extrabold text-primary-deep">
            Catalog
          </h2>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="flex items-center bg-muted rounded-full px-3 py-2 gap-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value.slice(0, 80))}
                placeholder="Search products…"
                className="bg-transparent flex-1 outline-none text-sm"
              />
            </div>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-xs font-semibold hover:scale-[1.02] transition-transform"
            >
              <Plus className="h-4 w-4" /> Add product
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-cream rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-extrabold text-primary-deep">
              No products
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Click <span className="font-semibold">Add product</span> to seed your
              catalog.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="border border-border rounded-2xl bg-background overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-muted relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                  {p.stock === 0 && (
                    <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full">
                      Out of stock
                    </span>
                  )}
                  {p.stock > 0 && p.stock <= LOW_STOCK && (
                    <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded-full">
                      Low: {p.stock}
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    {p.brand ?? "—"} · {p.category ?? "—"}
                  </p>
                  <h3 className="text-sm font-bold text-primary-deep line-clamp-2 flex-1">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-primary-deep">
                      {p.price}
                    </span>
                    <span className="text-xs font-semibold text-primary-deep">
                      {p.stock} in stock
                    </span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => setEditing(p)}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-muted text-primary-deep rounded-full py-1.5 text-xs font-semibold hover:bg-mint"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${p.name}"? This cannot be undone.`,
                          )
                        ) {
                          deleteProduct(p.id);
                          toast.success(`Removed ${p.name}`);
                        }
                      }}
                      className="inline-flex items-center justify-center bg-destructive/10 text-destructive rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-destructive/20"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={(values) => {
          addProduct({
            name: values.name,
            brand: values.brand || "Generic",
            category: values.category || "General",
            description: values.description,
            price: `$${values.price.toFixed(2)}`,
            image: values.image,
            stock: values.stock,
          });
          toast.success("Product added");
          setCreating(false);
        }}
      />

      <ProductDialog
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={(values) => {
          if (!editing) return;
          updateProduct(editing.id, {
            name: values.name,
            brand: values.brand || editing.brand || "Generic",
            category: values.category || editing.category || "General",
            description: values.description,
            price: `$${values.price.toFixed(2)}`,
            image: values.image,
            stock: values.stock,
          });
          toast.success("Product updated");
          setEditing(null);
        }}
      />
    </div>
  );
}

/* ============================ PRODUCT FORM ============================ */

type FormValues = {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string; // data URL or http(s) URL
};

function ProductDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: InventoryItem | null;
  onClose: () => void;
  onSubmit: (v: FormValues) => void;
}) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useMemo(() => {
    if (open) {
      setError(null);
      setName(initial?.name ?? "");
      setBrand(initial?.brand ?? "");
      setCategory(initial?.category ?? "");
      setDescription(initial?.description ?? "");
      setPrice(
        initial
          ? String(Number(String(initial.price).replace(/[^0-9.]/g, "")))
          : "",
      );
      setStock(initial ? String(initial.stock) : "");
      setImage(initial?.image ?? "");
    }
    // we want this to run when "open" or "initial" changes
  }, [open, initial]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > 1.2 * 1024 * 1024) {
      setError("Image must be under 1.2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = productSchema.safeParse({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      image,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    onSubmit({
      name: parsed.data.name,
      brand: brand.trim().slice(0, 60),
      category: category.trim().slice(0, 60),
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      image: parsed.data.image,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogTitle className="font-display text-2xl font-extrabold text-primary-deep">
          {initial ? "Edit product" : "Add product"}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Fill in the details. Stock decreases automatically when customers buy this
          item.
        </DialogDescription>

        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="h-24 w-24 shrink-0 rounded-2xl bg-muted overflow-hidden flex items-center justify-center relative">
              {image ? (
                <>
                  <img
                    src={image}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <ImageIcon className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-primary-deep">
                Product image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                className="block w-full text-xs file:mr-2 file:rounded-full file:border-0 file:bg-mint file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-deep hover:file:bg-primary"
              />
              <p className="text-[10px] text-muted-foreground">
                Or paste an image URL below.
              </p>
              <input
                type="url"
                value={image.startsWith("data:") ? "" : image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://…"
                className="w-full bg-muted rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-primary-deep">
              Product name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 120))}
              placeholder="e.g. Vitamin C 1000mg"
              className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-deep">
                Brand
              </label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value.slice(0, 60))}
                placeholder="Generic"
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-deep">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value.slice(0, 60))}
                placeholder="Vitamins"
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-primary-deep">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Short description shown on the storefront"
              className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-deep">
                Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99"
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-primary-deep">
                Stock
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="25"
                className="w-full bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-destructive">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted text-primary-deep rounded-full py-2.5 text-sm font-semibold hover:bg-mint"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-deep text-primary-deep-foreground rounded-full py-2.5 text-sm font-semibold hover:scale-[1.01] transition-transform"
            >
              {initial ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Stat({
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
    <div className={`${bg} rounded-2xl p-4 space-y-2`}>
      <div className="h-9 w-9 rounded-xl bg-background/70 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary-deep" />
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-primary-deep/70">
        {label}
      </div>
      <div className="font-display text-2xl font-extrabold text-primary-deep">
        {value}
      </div>
    </div>
  );
}
