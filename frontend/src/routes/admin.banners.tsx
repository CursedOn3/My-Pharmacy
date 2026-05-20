import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Image as ImageIcon, Megaphone, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api, type MarketingBanner } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBannersPage,
  head: () => ({
    meta: [{ title: "Banners — Admin" }],
  }),
});

function AdminBannersPage() {
  const [banners, setBanners] = useState<MarketingBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingBanner | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.adminListBanners();
        if (active) setBanners(data);
      } catch {
        toast.error("Failed to load banners");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (banner: MarketingBanner) => {
    setEditing(banner);
    setDialogOpen(true);
  };

  const handleSave = async (data: {
    title: string;
    description: string;
    image_url: string;
    placement: "home" | "products" | "checkout";
  }) => {
    try {
      if (editing) {
        const updated = await api.adminUpdateBanner(editing.id, {
          title: data.title,
          description: data.description || undefined,
          image_url: data.image_url || undefined,
          placement: data.placement,
        });
        setBanners((prev) => prev.map((b) => (b.id === editing.id ? updated : b)));
        toast.success("Banner updated");
      } else {
        const created = await api.adminCreateBanner({
          title: data.title,
          description: data.description || undefined,
          image_url: data.image_url || undefined,
          placement: data.placement,
          active: true,
        });
        setBanners((prev) => [created, ...prev]);
        toast.success("Banner created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save banner");
    }
  };

  const toggleActive = async (banner: MarketingBanner) => {
    try {
      const updated = await api.adminUpdateBanner(banner.id, { active: !banner.active });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
    } catch {
      toast.error("Failed to update banner");
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await api.adminDeleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  const activeBanners = banners.filter((b) => b.active).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-primary-deep">
            Banners
          </h2>
          <p className="text-sm text-muted-foreground">
            {banners.length} banner{banners.length !== 1 ? "s" : ""} &middot; {activeBanners} active
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          <Plus className="h-4 w-4" /> New Banner
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat icon={Megaphone} label="Total" value={banners.length} bg="bg-peach" />
        <Stat icon={Megaphone} label="Active" value={activeBanners} bg="bg-mint" />
        <Stat icon={ImageIcon} label="With image" value={banners.filter((b) => b.image_url).length} bg="bg-sun" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : banners.length === 0 ? (
        <div className="bg-cream rounded-3xl p-10 text-center space-y-3">
          <Megaphone className="h-10 w-10 mx-auto text-primary-deep/40" />
          <p className="text-primary-deep/70">No banners yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
            >
              {banner.image_url && (
                <div className="h-40 bg-muted">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary-deep truncate">
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {banner.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      banner.active
                        ? "bg-mint text-primary-deep"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {banner.active ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground capitalize">
                  Placement: {banner.placement}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openEdit(banner)}
                    className="inline-flex items-center gap-1.5 bg-muted text-primary-deep px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-mint transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => toggleActive(banner)}
                    className="inline-flex items-center gap-1.5 bg-muted text-primary-deep px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-mint transition-colors"
                  >
                    {banner.active ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="ml-auto h-8 w-8 rounded-full inline-flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20"
                    aria-label="Delete banner"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="font-display text-lg font-extrabold text-primary-deep">
            {editing ? "Edit Banner" : "New Banner"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editing ? "Update banner information and image." : "Create a new promotional banner."}
          </DialogDescription>
          <BannerForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BannerForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: MarketingBanner | null;
  onSave: (data: { title: string; description: string; image_url: string; placement: "home" | "products" | "checkout" }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [placement, setPlacement] = useState<"home" | "products" | "checkout">(
    initial?.placement ?? "home"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    onSave({ title: title.trim(), description: description.trim(), image_url: imageUrl.trim(), placement });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-primary-deep/70">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none"
          placeholder="e.g. Summer wellness sale up to 25% off"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-primary-deep/70">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
          placeholder="Optional description for the banner"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-primary-deep/70">Image URL</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none"
          placeholder="https://example.com/banner-image.jpg"
        />
        {imageUrl && (
          <div className="relative mt-2 h-32 bg-muted rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-primary-deep/70">Placement</label>
        <select
          value={placement}
          onChange={(e) => setPlacement(e.target.value as typeof placement)}
          className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none"
        >
          <option value="home">Home</option>
          <option value="products">Products</option>
          <option value="checkout">Checkout</option>
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-primary-deep text-primary-deep-foreground py-2.5 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          {initial ? "Save Changes" : "Create Banner"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-primary-deep bg-muted hover:bg-mint transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
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
